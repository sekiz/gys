const { prisma } = require('../config/database');

/**
 * Get aggregated dashboard statistics for admin
 */
async function getDashboardStats(req, res, next) {
    try {
        // 1. Get Counts
        const [
            totalUsers,
            newUsers,
            totalExams,
            totalQuestions,
            pendingPackages,
            activePackages,
            totalRevenue
        ] = await Promise.all([
            // Total Users (excluding the current admin might be good, but generally just count all)
            prisma.user.count(),

            // New Users (last 30 days)
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setDate(new Date().getDate() - 30))
                    }
                }
            }),

            // Total Exams
            prisma.exam.count(),

            // Total Questions
            prisma.question.count(),

            // Pending Package Approvals
            prisma.userPackage.count({
                where: {
                    status: 'PENDING'
                }
            }),

            // Active Packages
            prisma.userPackage.count({
                where: {
                    status: 'ACTIVE'
                }
            }),

            // Total Revenue (Sum of paymentAmount in UserPackage where status is ACTIVE)
            prisma.userPackage.aggregate({
                _sum: {
                    paymentAmount: true
                },
                where: {
                    status: 'ACTIVE'
                }
            })
        ]);

        // 2. Get Recent Users (Last 5)
        const recentUsers = await prisma.user.findMany({
            take: 5,
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        // 3. Get Recent Sales (Last 5 Active/Pending Packages)
        const recentSales = await prisma.userPackage.findMany({
            take: 5,
            orderBy: {
                createdAt: 'desc' // or purchasedAt
            },
            where: {
                status: {
                    in: ['ACTIVE', 'PENDING']
                }
            },
            include: {
                user: { select: { name: true, email: true } },
                exam: { select: { name: true } }
            }
        });

        // 4. Monthly User Growth (Last 6 months)
        // This is a bit complex with Prisma, often easier to fetch all users created after date X and group in JS
        // or use raw query. For simplicity and portability, let's fetch users created in last 6 months and group in JS.
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const usersLast6Months = await prisma.user.findMany({
            where: {
                createdAt: {
                    gte: sixMonthsAgo
                }
            },
            select: {
                createdAt: true
            }
        });

        // Group by Month (YYYY-MM)
        const monthlyGrowth = {};
        usersLast6Months.forEach(u => {
            const month = u.createdAt.toISOString().slice(0, 7); // 2023-01
            monthlyGrowth[month] = (monthlyGrowth[month] || 0) + 1;
        });

        // Format for chart [{ name: 'Jan', users: 10 }, ...]
        const chartData = Object.keys(monthlyGrowth).sort().map(key => {
            const date = new Date(key + '-01');
            return {
                name: date.toLocaleDateString('tr-TR', { month: 'short' }),
                users: monthlyGrowth[key]
            };
        });

        res.json({
            success: true,
            data: {
                counts: {
                    totalUsers,
                    newUsers,
                    totalExams,
                    totalQuestions,
                    pendingPackages,
                    activePackages,
                    totalRevenue: totalRevenue._sum.paymentAmount || 0
                },
                recentUsers,
                recentSales,
                chartData
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        next(error);
    }
}

module.exports = {
    getDashboardStats
};
