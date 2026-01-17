const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Public: Get all active slides ordered by 'order'
async function getPublicSlides(req, res, next) {
    try {
        const slides = await prisma.heroSlide.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });

        // If no slides exist, return defaults or empty array? 
        // Return empty, frontend handles default fallback if needed.
        return res.json({ success: true, data: { slides } });
    } catch (error) {
        next(error);
    }
}

// Admin: Get all slides (including inactive)
async function getAllSlides(req, res, next) {
    try {
        const slides = await prisma.heroSlide.findMany({
            orderBy: { order: 'asc' },
        });
        return res.json({ success: true, data: { slides } });
    } catch (error) {
        next(error);
    }
}

// Admin: Create Slide
async function createSlide(req, res, next) {
    try {
        const { title, subtitle, imageUrl, buttonText, link, order, isActive } = req.body;

        const slide = await prisma.heroSlide.create({
            data: {
                title,
                subtitle,
                imageUrl,
                buttonText: buttonText || 'İncele',
                link: link || '/',
                order: order ? parseInt(order) : 0,
                isActive: isActive !== undefined ? isActive : true,
            }
        });

        return res.json({ success: true, data: { slide } });
    } catch (error) {
        next(error);
    }
}

// Admin: Update Slide
async function updateSlide(req, res, next) {
    try {
        const { id } = req.params;
        const { title, subtitle, imageUrl, buttonText, link, order, isActive } = req.body;

        const slide = await prisma.heroSlide.update({
            where: { id },
            data: {
                title,
                subtitle,
                imageUrl,
                buttonText,
                link,
                order: order ? parseInt(order) : undefined,
                isActive
            }
        });

        return res.json({ success: true, data: { slide } });
    } catch (error) {
        next(error);
    }
}

// Admin: Delete Slide
async function deleteSlide(req, res, next) {
    try {
        const { id } = req.params;
        await prisma.heroSlide.delete({ where: { id } });
        return res.json({ success: true, message: 'Slide deleted successfully' });
    } catch (error) {
        next(error);
    }
}

// Admin: Reorder Slides
async function reorderSlides(req, res, next) {
    try {
        const { slideIds } = req.body; // Array of IDs in new order

        // Transaction to update all orders
        await prisma.$transaction(
            slideIds.map((id, index) =>
                prisma.heroSlide.update({
                    where: { id },
                    data: { order: index }
                })
            )
        );

        return res.json({ success: true, message: 'Slides reordered successfully' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getPublicSlides,
    getAllSlides,
    createSlide,
    updateSlide,
    deleteSlide,
    reorderSlides
};
