import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaBuilding, FaHeartbeat, FaBalanceScale, FaTree, FaShieldAlt,
    FaMoneyBillWave, FaLandmark, FaUniversity, FaMosque, FaBriefcase, FaGraduationCap
} from 'react-icons/fa';
import './InstitutionGrid.css';

// Mock Data for Institutions
// Renkler: pasteller (blue-50, green-50, etc.)
// Bu renkleri inline style olarak bg color vereceğiz.
const institutions = [
    {
        id: 1,
        name: 'Sağlık Bakanlığı',
        count: '15 Sınav',
        icon: <FaHeartbeat size={24} color="#449D48" />, // Green icon
        bgColor: '#E1F7E3', // Green bg
        link: '/sinav/saglik-bakanligi'
    },
    {
        id: 2,
        name: 'Milli Eğitim Bakanlığı',
        count: '23 Sınav',
        icon: <FaGraduationCap size={24} color="#2563EB" />, // Blue icon
        bgColor: '#F0F4FF', // Blue bg
        link: '/sinav/meb'
    },
    {
        id: 3,
        name: 'Adalet Bakanlığı',
        count: '8 Sınav',
        icon: <FaBalanceScale size={24} color="#FF5B5B" />, // Pink icon (closest for red theme)
        bgColor: '#FFF0F0', // Pink bg (closest for red theme)
        link: '/sinav/adalet-bakanligi'
    },
    {
        id: 4,
        name: 'Tarım ve Orman Bk.',
        count: '12 Sınav',
        icon: <FaTree size={24} color="#449D48" />, // Green icon
        bgColor: '#E1F7E3', // Green bg
        link: '/sinav/tarim-orman'
    },
    {
        id: 5,
        name: 'İçişleri Bakanlığı',
        count: '9 Sınav',
        icon: <FaShieldAlt size={24} color="#5B5B9B" />, // Purple icon
        bgColor: '#EBEBFF', // Purple bg
        link: '/sinav/icisleri'
    },
    {
        id: 6,
        name: 'Gelir İdaresi Bşk.',
        count: '5 Sınav',
        icon: <FaMoneyBillWave size={24} color="#CA8A04" />, // Yellow icon
        bgColor: '#FEFCE8', // Yellow bg
        link: '/sinav/gib'
    },
    {
        id: 7,
        name: 'Sosyal Güvenlik Kurumu',
        count: '7 Sınav',
        icon: <FaBuilding size={24} color="#0891B2" />, // Cyan icon
        bgColor: '#E0F2FE', // Cyan bg
        link: '/sinav/sgk'
    },
    {
        id: 8,
        name: 'Diyanet İşleri Bşk.',
        count: '4 Sınav',
        icon: <FaMosque size={24} color="#449D48" />, // Green icon
        bgColor: '#E1F7E3', // Green bg
        link: '/sinav/diyanet'
    },
    {
        id: 9,
        name: 'Ticaret Bakanlığı',
        count: '6 Sınav',
        icon: <FaBriefcase size={24} color="#5B5B9B" />, // Purple icon
        bgColor: '#EBEBFF', // Purple bg
        link: '/sinav/ticaret'
    },
    {
        id: 10,
        name: 'Gençlik ve Spor Bk.',
        count: '3 Sınav',
        icon: <FaLandmark size={24} color="#FF5B5B" />, // Pink icon
        bgColor: '#FFF0F0', // Pink bg
        link: '/sinav/gsb'
    },
    {
        id: 11,
        name: 'Yükseköğretim (YÖK)',
        count: '18 Sınav',
        icon: <FaUniversity size={24} color="#FF9142" />, // Orange icon
        bgColor: '#FFF2E5', // Orange bg
        link: '/sinav/yok'
    },
    {
        id: 12,
        name: 'Aile ve Sosyal Hiz.',
        count: '5 Sınav',
        icon: <FaHeartbeat size={24} color="#FF5B5B" />, // Pink icon
        bgColor: '#FFF0F0', // Pink bg
        link: '/sinav/aile'
    }
];

function InstitutionGrid() {
    const navigate = useNavigate();

    return (
        <div className="institution-grid-container">
            <div className="institution-grid-inner">
                <div className="institution-grid-header">
                    <h2>Popüler Kurumlar</h2>
                </div>

                <div className="institution-grid">
                    {institutions.map((item) => (
                        <div
                            key={item.id}
                            className="institution-card"
                            style={{ backgroundColor: item.bgColor }}
                            onClick={() => navigate(item.link)}
                        >
                            <div className="icon-box">
                                {item.icon}
                            </div>
                            <div className="info-box">
                                <h3>{item.name}</h3>
                                <span>{item.count}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="browse-all-container">
                    Daha fazla kurum ve sınav için
                    <span className="browse-all-link" onClick={() => navigate('/paketler')}>
                        Tümünü Gör →
                    </span>
                </div>
            </div>
        </div>
    );
}

export default InstitutionGrid;
