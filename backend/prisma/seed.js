// Seed script - Örnek verileri veritabanına yükler
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed data yükleniyor...');

  // Admin kullanıcı oluştur
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@uzmangys.com' },
    update: {},
    create: {
      email: 'admin@uzmangys.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      isActive: true,
      loginAttempts: 0,
    },
  });

  console.log('✅ Admin kullanıcı oluşturuldu:', admin.email);

  // Test kullanıcısı oluştur
  const testUserPassword = await bcrypt.hash('test123', 10);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@uzmangys.com' },
    update: {},
    create: {
      email: 'test@uzmangys.com',
      password: testUserPassword,
      name: 'Test User',
      role: 'STUDENT',
      isActive: true,
      loginAttempts: 0,
    },
  });

  console.log('✅ Test kullanıcısı oluşturuldu:', testUser.email);

  // Adalet Bakanlığı GYS sınavı oluştur
  const adaletExam = await prisma.exam.upsert({
    where: { code: 'adalet-gys' },
    update: {},
    create: {
      name: 'Adalet Bakanlığı Görevde Yükselme',
      description: 'Zabıt Katibi, İcra Katibi ve diğer pozisyonlar için görevde yükselme sınavı',
      code: 'adalet-gys',
      isActive: true,
    },
  });

  console.log('✅ Sınav oluşturuldu:', adaletExam.name);

  // Diğer sınavları oluştur
  const otherExams = [
    {
      name: 'Adalet Bakanlığı Unvan Değişikliği',
      description: 'Unvan değişikliği sınavlarına yönelik kapsamlı hazırlık ve soru bankası',
      code: 'adalet-unvan',
      isActive: true,
    },
    {
      name: 'İcra Müdür Yardımcılığı Sınavı',
      description: 'İcra Müdür Yardımcılığı pozisyonu için özel hazırlanmış soru bankası ve eğitim materyalleri',
      code: 'icra-mudur',
      isActive: true,
    },
    {
      name: 'Komiser Yardımcılığı Sınavı',
      description: 'Emniyet Teşkilatı Komiser Yardımcılığı sınavına yönelik detaylı hazırlık programı',
      code: 'komiser',
      isActive: true,
    },
    {
      name: 'Tapu Kadastro Görevde Yükselme',
      description: 'Tapu ve Kadastro Genel Müdürlüğü görevde yükselme sınavı için özel hazırlık',
      code: 'tapu',
      isActive: true,
    },
    {
      name: 'Gençlik ve Spor Bakanlığı GYS',
      description: 'Gençlik ve Spor Bakanlığı personeli için görevde yükselme sınavı hazırlık platformu',
      code: 'genclik-spor',
      isActive: true,
    },
  ];

  const createdExams = [adaletExam];
  for (const examData of otherExams) {
    const exam = await prisma.exam.upsert({
      where: { code: examData.code },
      update: {},
      create: examData,
    });
    createdExams.push(exam);
    console.log('✅ Sınav oluşturuldu:', exam.name);
  }

  // Adalet GYS için konular oluştur
  const adaletTopics = [
    {
      name: 'Türkiye Cumhuriyeti Anayasası',
      description: 'Anayasa maddeleri ve temel ilkeler',
      examId: adaletExam.id,
      order: 1,
    },
    {
      name: '657 Sayılı Devlet Memurları Kanunu ve İlgili Mevzuat',
      description: 'Devlet memurları kanunu ve ilgili mevzuat',
      examId: adaletExam.id,
      order: 2,
    },
    {
      name: 'Devlet Teşkilatı ile İlgili Mevzuat',
      description: 'Devlet teşkilatı ve yapısı',
      examId: adaletExam.id,
      order: 3,
    },
    {
      name: 'Atatürk İlkeleri ve İnkılap Tarihi, Ulusal Güvenlik',
      description: 'Atatürk ilkeleri ve inkılap tarihi',
      examId: adaletExam.id,
      order: 4,
    },
    {
      name: 'Türkçe Dil Bilgisi ve Yazışma ile İlgili Kurallar',
      description: 'Türkçe dil bilgisi ve resmi yazışma kuralları',
      examId: adaletExam.id,
      order: 5,
    },
    {
      name: 'Halkla İlişkiler',
      description: 'Halkla ilişkiler ilkeleri ve uygulamaları',
      examId: adaletExam.id,
      order: 6,
    },
    {
      name: 'Etik Davranış İlkeleri',
      description: 'Kamu görevlileri etik davranış ilkeleri',
      examId: adaletExam.id,
      order: 7,
    },
    {
      name: 'Bakanlık Merkez Teşkilatı',
      description: 'Adalet Bakanlığı merkez teşkilatı',
      examId: adaletExam.id,
      order: 8,
    },
    {
      name: 'Adli ve İdari Yargı Adalet Komisyonlarının Yapısı ve Görevleri ile Yargı Örgütü',
      description: 'Yargı örgütü ve adalet komisyonları',
      examId: adaletExam.id,
      order: 9,
    },
    {
      name: 'Ulusal Yargı Ağı Bilişim Sistemi',
      description: 'UYAP sistemi ve kullanımı',
      examId: adaletExam.id,
      order: 10,
    },
    {
      name: '5018 Sayılı Kamu Mali Yönetimi ve Kontrol Kanunu',
      description: 'Kamu mali yönetimi ve kontrol kanunu',
      examId: adaletExam.id,
      order: 11,
    },
  ];

  const topics = adaletTopics;

  const createdTopics = [];
  for (const topic of topics) {
    const created = await prisma.topic.create({
      data: topic,
    });
    createdTopics.push(created);
    console.log('✅ Konu oluşturuldu:', created.name);
  }

  // Örnek sorular oluştur (her konu için birkaç soru)
  const questions = [
    // Anayasa soruları
    {
      topicId: createdTopics[0].id,
      question: "Türkiye Cumhuriyeti Anayasası'nın değiştirilemeyecek hükümlerini düzenleyen madde hangisidir?",
      type: 'MULTIPLE_CHOICE',
      options: ['Madde 2', 'Madde 3', 'Madde 4', 'Madde 5'],
      correctAnswer: 2,
      explanation: "Anayasanın 4. maddesi, değiştirilemeyecek hükümleri düzenler.",
      difficulty: 'MEDIUM',
    },
    {
      topicId: createdTopics[0].id,
      question: "Aşağıdakilerden hangisi Türkiye Cumhuriyeti'nin niteliklerinden biri değildir?",
      type: 'MULTIPLE_CHOICE',
      options: ['Demokratik', 'Lâik', 'Federal', 'Sosyal hukuk devleti'],
      correctAnswer: 2,
      explanation: "Türkiye Cumhuriyeti üniter devlet yapısına sahiptir, federal değildir.",
      difficulty: 'EASY',
    },
    {
      topicId: createdTopics[0].id,
      question: "Türkiye Cumhuriyeti'nin başkenti hangi şehirdir?",
      type: 'MULTIPLE_CHOICE',
      options: ['İstanbul', 'Ankara', 'İzmir', 'Bursa'],
      correctAnswer: 1,
      explanation: "Anayasanın 3. maddesine göre Türkiye Cumhuriyeti'nin başkenti Ankara'dır.",
      difficulty: 'EASY',
    },
    {
      topicId: createdTopics[0].id,
      question: "Anayasaya göre, Türkiye Devleti'nin dili hangisidir?",
      type: 'MULTIPLE_CHOICE',
      options: ['Osmanlıca', 'Türkçe', 'Arapça', 'İngilizce'],
      correctAnswer: 1,
      explanation: "Anayasanın 3. maddesine göre Türkiye Devleti'nin dili Türkçedir.",
      difficulty: 'EASY',
    },
    // 657 DMK soruları
    {
      topicId: createdTopics[1].id,
      question: "657 sayılı Devlet Memurları Kanunu'na göre, Devlet memuru kimdir?",
      type: 'MULTIPLE_CHOICE',
      options: [
        'Maaş karşılığında çalışan herkes',
        'Devlet ve diğer kamu tüzel kişiliklerince genel idare esaslarına göre yürütülen asli ve sürekli kamu hizmetlerini ifa ile görevlendirilenler',
        'Sadece kadrolu çalışanlar',
        'Sözleşmeli personel',
      ],
      correctAnswer: 1,
      explanation: "657 sayılı Kanun'un 4. maddesine göre Devlet memuru tanımı.",
      difficulty: 'MEDIUM',
    },
    {
      topicId: createdTopics[1].id,
      question: "Devlet memurlarının görevde yükselme sınavları kaç yılda bir yapılır?",
      type: 'MULTIPLE_CHOICE',
      options: ['Her yıl', '2 yılda bir', '3 yılda bir', '5 yılda bir'],
      correctAnswer: 0,
      explanation: "657 sayılı Kanun'a göre görevde yükselme sınavları her yıl düzenli olarak yapılır.",
      difficulty: 'EASY',
    },
    {
      topicId: createdTopics[1].id,
      question: "Devlet memurlarının aylıksız izin süresi bir takvim yılı içinde en çok kaç aydır?",
      type: 'MULTIPLE_CHOICE',
      options: ['3 ay', '6 ay', '12 ay', '24 ay'],
      correctAnswer: 2,
      explanation: "657 sayılı Kanun'a göre aylıksız izin süresi bir takvim yılı içinde en çok 12 aydır.",
      difficulty: 'MEDIUM',
    },
    // Devlet Teşkilatı soruları
    {
      topicId: createdTopics[2].id,
      question: "Türkiye Cumhuriyeti'nde yasama yetkisi hangi organa aittir?",
      type: 'MULTIPLE_CHOICE',
      options: ['Cumhurbaşkanı', 'Bakanlar Kurulu', 'Türkiye Büyük Millet Meclisi', 'Anayasa Mahkemesi'],
      correctAnswer: 2,
      explanation: "Anayasanın 7. maddesine göre yasama yetkisi Türk Milleti adına Türkiye Büyük Millet Meclisi'nindir.",
      difficulty: 'EASY',
    },
    {
      topicId: createdTopics[2].id,
      question: "Yürütme yetkisi ve görevi, Anayasaya ve kanunlara uygun olarak hangi makamlar tarafından kullanılır ve yerine getirilir?",
      type: 'MULTIPLE_CHOICE',
      options: [
        'Sadece Cumhurbaşkanı',
        'Cumhurbaşkanı ve Bakanlar Kurulu',
        'Sadece Bakanlar Kurulu',
        'TBMM ve Cumhurbaşkanı',
      ],
      correctAnswer: 1,
      explanation: "Anayasanın 8. maddesine göre yürütme yetkisi ve görevi, Cumhurbaşkanı ve Bakanlar Kurulu tarafından kullanılır ve yerine getirilir.",
      difficulty: 'MEDIUM',
    },
    {
      topicId: createdTopics[2].id,
      question: "Türkiye Cumhuriyeti'nde kaç tane idari kısım (il) bulunmaktadır?",
      type: 'MULTIPLE_CHOICE',
      options: ['67', '77', '81', '85'],
      correctAnswer: 2,
      explanation: "Türkiye Cumhuriyeti 81 il (idari kısım) olarak teşkilatlanmıştır.",
      difficulty: 'EASY',
    },
    // Atatürk İlkeleri soruları
    {
      topicId: createdTopics[3].id,
      question: "Atatürk'ün altı ilkesinden hangisi Türk toplumunun çağdaş uygarlık düzeyine ulaşmasını hedefler?",
      type: 'MULTIPLE_CHOICE',
      options: ['Cumhuriyetçilik', 'Milliyetçilik', 'İnkılapçılık', 'Devletçilik'],
      correctAnswer: 2,
      explanation: "İnkılapçılık ilkesi, toplumun sürekli olarak gelişmesini ve çağdaş uygarlık düzeyine ulaşmasını hedefler.",
      difficulty: 'MEDIUM',
    },
    {
      topicId: createdTopics[3].id,
      question: "TBMM hangi tarihte açılmıştır?",
      type: 'MULTIPLE_CHOICE',
      options: ['19 Mayıs 1919', '23 Nisan 1920', '30 Ağustos 1922', '29 Ekim 1923'],
      correctAnswer: 1,
      explanation: "Türkiye Büyük Millet Meclisi 23 Nisan 1920 tarihinde Ankara'da açılmıştır.",
      difficulty: 'EASY',
    },
    // Türkçe soruları
    {
      topicId: createdTopics[4].id,
      question: "Resmi yazışmalarda hangi yazı karakteri kullanılır?",
      type: 'MULTIPLE_CHOICE',
      options: ['El yazısı', 'Times New Roman', 'Arial', 'Resmi yazışmalarda kullanılması öngörülen font'],
      correctAnswer: 3,
      explanation: "Resmi Yazışmalarda Uygulanacak Usul ve Esaslar Hakkında Yönetmelik'e göre belirlenen font kullanılır.",
      difficulty: 'MEDIUM',
    },
    {
      topicId: createdTopics[4].id,
      question: "Resmi yazılarda paragraflar arası kaç satır boşluk bırakılır?",
      type: 'MULTIPLE_CHOICE',
      options: ['Boşluk bırakılmaz', '1 satır', '2 satır', '3 satır'],
      correctAnswer: 1,
      explanation: "Resmi Yazışmalarda Uygulanacak Usul ve Esaslar Hakkında Yönetmelik'e göre paragraflar arası 1 satır boşluk bırakılır.",
      difficulty: 'EASY',
    },
    // Halkla İlişkiler soruları
    {
      topicId: createdTopics[5].id,
      question: "Halkla ilişkilerin temel amacı nedir?",
      type: 'MULTIPLE_CHOICE',
      options: [
        'Sadece tanıtım yapmak',
        'Kurum ile hedef kitle arasında karşılıklı anlayış ve güven oluşturmak',
        'Reklam yapmak',
        'Sadece bilgi vermek',
      ],
      correctAnswer: 1,
      explanation: "Halkla ilişkilerin temel amacı, kurum ile hedef kitle arasında karşılıklı anlayış, güven ve iyi niyet oluşturmaktır.",
      difficulty: 'EASY',
    },
    // Etik soruları
    {
      topicId: createdTopics[6].id,
      question: "Kamu görevlilerinin uyması gereken temel etik ilkelerden hangisi, görevini yerine getirirken hiçbir ayrım yapmaksızın herkese eşit mesafede durmayı gerektirir?",
      type: 'MULTIPLE_CHOICE',
      options: ['Saydamlık', 'Tarafsızlık', 'Dürüstlük', 'Hesap verebilirlik'],
      correctAnswer: 1,
      explanation: "Tarafsızlık ilkesi, kamu görevlilerinin görevlerini yerine getirirken hiçbir ayrım yapmaksızın herkese eşit mesafede durmalarını gerektirir.",
      difficulty: 'MEDIUM',
    },
    // Bakanlık Teşkilatı soruları
    {
      topicId: createdTopics[7].id,
      question: "Adalet Bakanlığı'nın merkez teşkilatında yer alan birimlerden hangisi personel işlerinden sorumludur?",
      type: 'MULTIPLE_CHOICE',
      options: [
        'Strateji Geliştirme Başkanlığı',
        'Personel Genel Müdürlüğü',
        'Ceza ve Tevkifevleri Genel Müdürlüğü',
        'Eğitim Dairesi Başkanlığı',
      ],
      correctAnswer: 1,
      explanation: "Personel Genel Müdürlüğü, Bakanlık personelinin atama, terfi, özlük hakları gibi işlerinden sorumludur.",
      difficulty: 'MEDIUM',
    },
    // Yargı Örgütü soruları
    {
      topicId: createdTopics[8].id,
      question: "Türkiye'de idari yargının en üst mahkemesi hangisidir?",
      type: 'MULTIPLE_CHOICE',
      options: ['Yargıtay', 'Danıştay', 'Anayasa Mahkemesi', 'Sayıştay'],
      correctAnswer: 1,
      explanation: "Danıştay, Türkiye'de idari yargının en üst mahkemesidir.",
      difficulty: 'EASY',
    },
    {
      topicId: createdTopics[8].id,
      question: "Adli yargının en üst mahkemesi hangisidir?",
      type: 'MULTIPLE_CHOICE',
      options: ['Danıştay', 'Yargıtay', 'Bölge İdare Mahkemesi', 'Anayasa Mahkemesi'],
      correctAnswer: 1,
      explanation: "Yargıtay, Türkiye'de adli yargının en üst mahkemesidir.",
      difficulty: 'EASY',
    },
    // UYAP soruları
    {
      topicId: createdTopics[9].id,
      question: "UYAP'ın açılımı nedir?",
      type: 'MULTIPLE_CHOICE',
      options: [
        'Ulusal Yargı Ağı Programı',
        'Ulusal Yargı Ağı Projesi',
        'Ulusal Yönetim Ağı Projesi',
        'Uluslararası Yargı Ağı Projesi',
      ],
      correctAnswer: 1,
      explanation: "UYAP, Ulusal Yargı Ağı Projesi'nin kısaltmasıdır ve Türk yargı sisteminin elektronik ortamda yürütülmesini sağlar.",
      difficulty: 'EASY',
    },
    // 5018 soruları
    {
      topicId: createdTopics[10].id,
      question: "5018 sayılı Kamu Mali Yönetimi ve Kontrol Kanunu'nun temel amacı nedir?",
      type: 'MULTIPLE_CHOICE',
      options: [
        'Sadece bütçe hazırlamak',
        'Kamu kaynaklarının etkili, ekonomik ve verimli bir şekilde elde edilmesi ve kullanılmasını sağlamak',
        'Vergi toplamak',
        'Sadece harcama yapmak',
      ],
      correctAnswer: 1,
      explanation: "5018 sayılı Kanun'un temel amacı, kamu kaynaklarının etkili, ekonomik ve verimli bir şekilde elde edilmesi ve kullanılmasını sağlamaktır.",
      difficulty: 'MEDIUM',
    },
  ];

  for (const question of questions) {
    await prisma.question.create({
      data: question,
    });
    console.log('✅ Soru oluşturuldu');
  }

  // Örnek makaleler oluştur (Anayasa maddeleri)
  const articles = [
    {
      topicId: createdTopics[0].id,
      title: 'Madde 1 - Devletin Şekli',
      content: 'Türkiye Devleti bir Cumhuriyettir.',
      order: 1,
    },
    {
      topicId: createdTopics[0].id,
      title: 'Madde 2 - Cumhuriyetin Nitelikleri',
      content: 'Türkiye Cumhuriyeti, toplumun huzuru, millî dayanışma ve adalet anlayışı içinde, insan haklarına saygılı, Atatürk milliyetçiliğine bağlı, başlangıçta belirtilen temel ilkelere dayanan, demokratik, lâik ve sosyal bir hukuk Devletidir.',
      order: 2,
    },
    {
      topicId: createdTopics[0].id,
      title: 'Madde 3 - Devletin Bütünlüğü, Dili, Bayrağı, Marşı ve Başkenti',
      content: 'Türkiye Devleti, ülkesi ve milletiyle bölünmez bir bütündür. Dili Türkçedir. Bayrağı, şekli kanununda belirtilen, beyaz ay yıldızlı al bayraktır. Millî marşı "İstiklâl Marşı"dır. Başkenti Ankara\'dır.',
      order: 3,
    },
    {
      topicId: createdTopics[0].id,
      title: 'Madde 4 - Değiştirilemeyecek Hükümler',
      content: 'Anayasanın 1 inci maddesindeki Devletin şeklinin Cumhuriyet olduğu hakkındaki hüküm ile, 2 nci maddesindeki Cumhuriyetin nitelikleri ve 3 üncü maddesi hükümleri değiştirilemez ve değiştirilmesi teklif edilemez.',
      order: 4,
    },
    {
      topicId: createdTopics[0].id,
      title: 'Madde 5 - Devletin Temel Amaç ve Görevleri',
      content: 'Devletin temel amaç ve görevleri, Türk milletinin bağımsızlığını ve bütünlüğünü, ülkenin bölünmezliğini, Cumhuriyeti ve demokrasiyi korumak, kişilerin ve toplumun refah, huzur ve mutluluğunu sağlamak; kişinin temel hak ve hürriyetlerini, sosyal hukuk devleti ve adalet ilkeleriyle bağdaşmayacak surette sınırlayan siyasal, ekonomik ve sosyal engelleri kaldırmaya, insanın maddi ve manevi varlığının gelişmesi için gerekli şartları hazırlamaya çalışmaktır.',
      order: 5,
    },
  ];

  for (const article of articles) {
    await prisma.article.create({
      data: article,
    });
    console.log('✅ Makale oluşturuldu:', article.title);
  }

  // Örnek özetler oluştur
  const summaries = [
    {
      topicId: createdTopics[0].id,
      title: 'Devletin Şekli',
      content: 'Türkiye Devleti bir Cumhuriyettir. Bu hüküm değiştirilemez ve değiştirilmesi teklif edilemez.',
      order: 1,
    },
    {
      topicId: createdTopics[0].id,
      title: 'Cumhuriyetin Nitelikleri',
      content: 'Türkiye Cumhuriyeti; demokratik, lâik ve sosyal bir hukuk devletidir. İnsan haklarına saygılı ve Atatürk milliyetçiliğine bağlıdır.',
      order: 2,
    },
    {
      topicId: createdTopics[0].id,
      title: 'Devletin Bütünlüğü',
      content: 'Türkiye Devleti, ülkesi ve milletiyle bölünmez bir bütündür. Resmi dili Türkçedir, başkenti Ankara\'dır.',
      order: 3,
    },
    {
      topicId: createdTopics[0].id,
      title: 'Değiştirilemeyecek Hükümler',
      content: 'Anayasanın 1, 2 ve 3. maddeleri değiştirilemez. Bu maddeler Cumhuriyetin temelini oluşturur.',
      order: 4,
    },
    {
      topicId: createdTopics[0].id,
      title: 'Devletin Temel Amaçları',
      content: 'Bağımsızlık ve bütünlüğü korumak, demokrasiyi yaşatmak, kişilerin refah ve mutluluğunu sağlamak, temel hak ve özgürlükleri güvence altına almak.',
      order: 5,
    },
    {
      topicId: createdTopics[1].id,
      title: 'Devlet Memuru Tanımı',
      content: 'Devlet ve diğer kamu tüzel kişiliklerince genel idare esaslarına göre yürütülen asli ve sürekli kamu hizmetlerini ifa ile görevlendirilenler.',
      order: 1,
    },
    {
      topicId: createdTopics[1].id,
      title: 'Görevde Yükselme',
      content: 'Görevde yükselme sınavları her yıl düzenli olarak yapılır. Memurlar bu sınavlara girerek bir üst kadroya yükselebilir.',
      order: 2,
    },
  ];

  for (const summary of summaries) {
    await prisma.summary.create({
      data: summary,
    });
    console.log('✅ Özet oluşturuldu:', summary.title);
  }

  // İcra Müdür Yardımcılığı Sınavı için veri ekle
  const icraExam = await prisma.exam.findUnique({
    where: { code: 'icra-mudur' },
  });

  if (icraExam) {
    console.log('📝 İcra Müdür Yardımcılığı Sınavı için veri ekleniyor...');

    // 5 konu oluştur
    const icraTopics = [
      {
        name: 'İcra ve İflas Hukuku',
        description: 'İcra ve iflas hukukunun temel ilkeleri ve uygulamaları',
        examId: icraExam.id,
        order: 1,
      },
      {
        name: 'Hukuk Usulü Muhakemeleri Kanunu',
        description: 'Hukuk usulü muhakemeleri kanunu ve uygulaması',
        examId: icraExam.id,
        order: 2,
      },
      {
        name: 'Borçlar Hukuku',
        description: 'Borçlar hukukunun genel hükümleri',
        examId: icraExam.id,
        order: 3,
      },
      {
        name: 'Medeni Hukuk',
        description: 'Medeni hukukun temel kavramları ve uygulamaları',
        examId: icraExam.id,
        order: 4,
      },
      {
        name: 'İcra Müdürlüğü Teşkilatı ve Görevleri',
        description: 'İcra müdürlüğü teşkilatı, görevleri ve yetkileri',
        examId: icraExam.id,
        order: 5,
      },
    ];

    const createdIcraTopics = [];
    for (const topic of icraTopics) {
      const existing = await prisma.topic.findFirst({
        where: {
          examId: icraExam.id,
          name: topic.name,
        },
      });

      if (!existing) {
        const created = await prisma.topic.create({
          data: topic,
        });
        createdIcraTopics.push(created);
        console.log('✅ Konu oluşturuldu:', created.name);
      } else {
        createdIcraTopics.push(existing);
        console.log('ℹ️ Konu zaten mevcut:', existing.name);
      }
    }

    // Her konu için 5 soru, konu anlatımı ve özet ekle
    const icraQuestions = [
      // İcra ve İflas Hukuku soruları
      {
        topicId: createdIcraTopics[0].id,
        question: 'İcra ve İflas Kanunu\'na göre, icra takibinin başlatılması için gerekli belgeler nelerdir?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'Sadece icra emri',
          'İcra emri ve alacak belgesi',
          'İcra emri, alacak belgesi ve borçlunun adresi',
          'İcra emri, alacak belgesi, borçlunun adresi ve teminat',
        ],
        correctAnswer: 2,
        explanation: 'İcra takibinin başlatılması için icra emri, alacak belgesi ve borçlunun adresi gereklidir.',
        difficulty: 'MEDIUM',
      },
      {
        topicId: createdIcraTopics[0].id,
        question: 'İcra takibinde itiraz süresi kaç gündür?',
        type: 'MULTIPLE_CHOICE',
        options: ['5 gün', '7 gün', '10 gün', '15 gün'],
        correctAnswer: 1,
        explanation: 'İcra ve İflas Kanunu\'na göre itiraz süresi 7 gündür.',
        difficulty: 'EASY',
      },
      {
        topicId: createdIcraTopics[0].id,
        question: 'İcra takibinde haciz işlemi hangi aşamada yapılır?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'İcra emri tebliğ edildikten hemen sonra',
          'İtiraz süresi dolduktan sonra',
          'Ödeme emri tebliğ edildikten sonra',
          'Borçlu ödeme yapmadığında',
        ],
        correctAnswer: 2,
        explanation: 'Haciz işlemi, ödeme emri tebliğ edildikten sonra borçlu ödeme yapmadığında yapılır.',
        difficulty: 'MEDIUM',
      },
      {
        topicId: createdIcraTopics[0].id,
        question: 'İflas davası hangi mahkemede açılır?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'Asliye Hukuk Mahkemesi',
          'Sulh Hukuk Mahkemesi',
          'Ticaret Mahkemesi',
          'İcra Mahkemesi',
        ],
        correctAnswer: 2,
        explanation: 'İflas davası Ticaret Mahkemesi\'nde açılır.',
        difficulty: 'MEDIUM',
      },
      {
        topicId: createdIcraTopics[0].id,
        question: 'İcra takibinde ihtiyati haciz kararı hangi durumda verilir?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'Alacak kesinleştiğinde',
          'Alacağın tahsilinde tehlike olduğunda',
          'Borçlu ödeme yapmadığında',
          'İcra emri tebliğ edildiğinde',
        ],
        correctAnswer: 1,
        explanation: 'İhtiyati haciz kararı, alacağın tahsilinde tehlike olduğunda verilir.',
        difficulty: 'HARD',
      },
      // Hukuk Usulü Muhakemeleri Kanunu soruları
      {
        topicId: createdIcraTopics[1].id,
        question: 'Hukuk Usulü Muhakemeleri Kanunu\'na göre, dava açma süresi ne kadardır?',
        type: 'MULTIPLE_CHOICE',
        options: ['Zamanaşımı süresi içinde', '10 yıl', '20 yıl', 'Süresiz'],
        correctAnswer: 0,
        explanation: 'Dava açma süresi, ilgili kanunda belirtilen zamanaşımı süresi içinde olmalıdır.',
        difficulty: 'MEDIUM',
      },
      {
        topicId: createdIcraTopics[1].id,
        question: 'Dava dilekçesinde hangi bilgiler bulunmalıdır?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'Sadece tarafların adları',
          'Tarafların adları, dava konusu ve talep',
          'Tarafların adları ve dava konusu',
          'Sadece talep',
        ],
        correctAnswer: 1,
        explanation: 'Dava dilekçesinde tarafların adları, dava konusu ve talep açıkça belirtilmelidir.',
        difficulty: 'EASY',
      },
      {
        topicId: createdIcraTopics[1].id,
        question: 'Mahkeme kararının temyiz süresi kaç gündür?',
        type: 'MULTIPLE_CHOICE',
        options: ['7 gün', '15 gün', '30 gün', '60 gün'],
        correctAnswer: 1,
        explanation: 'Mahkeme kararının temyiz süresi 15 gündür.',
        difficulty: 'EASY',
      },
      {
        topicId: createdIcraTopics[1].id,
        question: 'Delil toplama işlemi hangi aşamada yapılır?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'Sadece dava açılmadan önce',
          'Sadece duruşma sırasında',
          'Dava açılmadan önce ve duruşma sırasında',
          'Sadece karar aşamasında',
        ],
        correctAnswer: 2,
        explanation: 'Delil toplama işlemi dava açılmadan önce ve duruşma sırasında yapılabilir.',
        difficulty: 'MEDIUM',
      },
      {
        topicId: createdIcraTopics[1].id,
        question: 'İstinaf başvurusu hangi mahkemeye yapılır?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'Aynı mahkemeye',
          'Bölge Adliye Mahkemesi\'ne',
          'Yargıtay\'a',
          'Anayasa Mahkemesi\'ne',
        ],
        correctAnswer: 1,
        explanation: 'İstinaf başvurusu Bölge Adliye Mahkemesi\'ne yapılır.',
        difficulty: 'MEDIUM',
      },
      // Borçlar Hukuku soruları
      {
        topicId: createdIcraTopics[2].id,
        question: 'Borçlar Kanunu\'na göre, sözleşmenin geçerliliği için hangisi gerekli değildir?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'Tarafların irade beyanı',
          'Sözleşme konusunun mümkün olması',
          'Sözleşme konusunun hukuka uygun olması',
          'Yazılı şekil şartı',
        ],
        correctAnswer: 3,
        explanation: 'Yazılı şekil şartı, sözleşmenin geçerliliği için her zaman gerekli değildir. Bazı sözleşmeler sözlü olarak da geçerli olabilir.',
        difficulty: 'MEDIUM',
      },
      {
        topicId: createdIcraTopics[2].id,
        question: 'Borçlunun temerrüde düşmesi ne anlama gelir?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'Borçlunun borcunu ödememesi',
          'Borçlunun borcunu zamanında ödememesi',
          'Borçlunun iflas etmesi',
          'Borçlunun borcunu kabul etmemesi',
        ],
        correctAnswer: 1,
        explanation: 'Temerrüt, borçlunun borcunu zamanında ödememesi durumudur.',
        difficulty: 'EASY',
      },
      {
        topicId: createdIcraTopics[2].id,
        question: 'Faiz oranı hangi durumda belirlenir?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'Sadece sözleşmede belirtilirse',
          'Kanunda belirtilen oran',
          'Sözleşmede belirtilirse veya kanunda belirtilen oran',
          'Mahkeme tarafından belirlenir',
        ],
        correctAnswer: 2,
        explanation: 'Faiz oranı sözleşmede belirtilirse o oran, belirtilmezse kanunda belirtilen oran uygulanır.',
        difficulty: 'MEDIUM',
      },
      {
        topicId: createdIcraTopics[2].id,
        question: 'Cezai şart nedir?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'Borçlunun cezalandırılması',
          'Sözleşmede belirtilen ceza',
          'Sözleşmede belirtilen ve borçlunun temerrüde düşmesi halinde ödemesi gereken miktar',
          'Mahkeme tarafından belirlenen ceza',
        ],
        correctAnswer: 2,
        explanation: 'Cezai şart, sözleşmede belirtilen ve borçlunun temerrüde düşmesi halinde ödemesi gereken miktardır.',
        difficulty: 'MEDIUM',
      },
      {
        topicId: createdIcraTopics[2].id,
        question: 'Zamanaşımı süresi genel olarak kaç yıldır?',
        type: 'MULTIPLE_CHOICE',
        options: ['5 yıl', '10 yıl', '15 yıl', '20 yıl'],
        correctAnswer: 1,
        explanation: 'Borçlar Kanunu\'na göre genel zamanaşımı süresi 10 yıldır.',
        difficulty: 'EASY',
      },
      // Medeni Hukuk soruları
      {
        topicId: createdIcraTopics[3].id,
        question: 'Medeni Kanun\'a göre, kişilik ne zaman başlar?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'Doğumla',
          'Gebelikle',
          '18 yaşında',
          'Evlenmeyle',
        ],
        correctAnswer: 0,
        explanation: 'Medeni Kanun\'a göre kişilik, doğumla başlar.',
        difficulty: 'EASY',
      },
      {
        topicId: createdIcraTopics[3].id,
        question: 'Ehliyetsizlik durumunda kim temsil eder?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'Vasi',
          'Kayyım',
          'Vasi veya kayyım',
          'Yakın akraba',
        ],
        correctAnswer: 2,
        explanation: 'Ehliyetsizlik durumunda vasi veya kayyım temsil eder.',
        difficulty: 'MEDIUM',
      },
      {
        topicId: createdIcraTopics[3].id,
        question: 'Mülkiyet hakkı nasıl kazanılır?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'Sadece satın alarak',
          'Sadece miras yoluyla',
          'Asli veya fer\'i yollarla',
          'Sadece bağış yoluyla',
        ],
        correctAnswer: 2,
        explanation: 'Mülkiyet hakkı asli (örneğin işgal) veya fer\'i (örneğin satın alma) yollarla kazanılabilir.',
        difficulty: 'MEDIUM',
      },
      {
        topicId: createdIcraTopics[3].id,
        question: 'Taşınmaz satışında hangi işlem gerekir?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'Sadece sözleşme',
          'Sözleşme ve tapu tescil',
          'Sadece tapu tescil',
          'Sözleşme ve noter onayı',
        ],
        correctAnswer: 1,
        explanation: 'Taşınmaz satışında sözleşme ve tapu tescil işlemi gereklidir.',
        difficulty: 'EASY',
      },
      {
        topicId: createdIcraTopics[3].id,
        question: 'Evlilik yaşı kaçtır?',
        type: 'MULTIPLE_CHOICE',
        options: ['16', '17', '18', '21'],
        correctAnswer: 2,
        explanation: 'Medeni Kanun\'a göre evlilik yaşı 18\'dir.',
        difficulty: 'EASY',
      },
      // İcra Müdürlüğü Teşkilatı ve Görevleri soruları
      {
        topicId: createdIcraTopics[4].id,
        question: 'İcra müdürü hangi makam tarafından atanır?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'Adalet Bakanlığı',
          'Hakim',
          'Cumhuriyet Başsavcısı',
          'Vali',
        ],
        correctAnswer: 0,
        explanation: 'İcra müdürü Adalet Bakanlığı tarafından atanır.',
        difficulty: 'EASY',
      },
      {
        topicId: createdIcraTopics[4].id,
        question: 'İcra müdürünün görevleri arasında hangisi yer almaz?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'İcra takiplerini yürütmek',
          'Haciz işlemlerini yapmak',
          'Mahkeme kararı vermek',
          'İcra işlemlerini takip etmek',
        ],
        correctAnswer: 2,
        explanation: 'İcra müdürü mahkeme kararı veremez, sadece icra işlemlerini yürütür.',
        difficulty: 'EASY',
      },
      {
        topicId: createdIcraTopics[4].id,
        question: 'İcra müdürlüğü hangi mahkemeye bağlıdır?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'Asliye Hukuk Mahkemesi',
          'Sulh Hukuk Mahkemesi',
          'İcra Mahkemesi',
          'Ticaret Mahkemesi',
        ],
        correctAnswer: 2,
        explanation: 'İcra müdürlüğü İcra Mahkemesi\'ne bağlıdır.',
        difficulty: 'MEDIUM',
      },
      {
        topicId: createdIcraTopics[4].id,
        question: 'İcra müdürünün yetkileri nelerdir?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'Sadece icra takiplerini yürütmek',
          'İcra takiplerini yürütmek, haciz yapmak ve satış işlemlerini gerçekleştirmek',
          'Sadece haciz yapmak',
          'Sadece satış işlemlerini yapmak',
        ],
        correctAnswer: 1,
        explanation: 'İcra müdürü icra takiplerini yürütmek, haciz yapmak ve satış işlemlerini gerçekleştirmek yetkisine sahiptir.',
        difficulty: 'MEDIUM',
      },
      {
        topicId: createdIcraTopics[4].id,
        question: 'İcra müdürlüğünde kaç icra müdür yardımcısı bulunur?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'En az 1',
          'En az 2',
          'En az 3',
          'Sayı sınırı yok',
        ],
        correctAnswer: 0,
        explanation: 'İcra müdürlüğünde en az 1 icra müdür yardımcısı bulunur.',
        difficulty: 'EASY',
      },
    ];

    for (const question of icraQuestions) {
      const existing = await prisma.question.findFirst({
        where: {
          topicId: question.topicId,
          question: question.question,
        },
      });

      if (!existing) {
        await prisma.question.create({
          data: question,
        });
        console.log('✅ Soru oluşturuldu');
      } else {
        console.log('ℹ️ Soru zaten mevcut');
      }
    }

    // Her konu için konu anlatımı (Article) ekle
    const icraArticles = [
      {
        topicId: createdIcraTopics[0].id,
        title: 'İcra Takibinin Başlatılması',
        content: 'İcra takibi, alacaklının borçludan alacağını tahsil etmek için başvurduğu hukuki yoldur. İcra takibinin başlatılması için icra emri, alacak belgesi ve borçlunun adresi gereklidir. İcra emri, icra müdürlüğü tarafından borçluya tebliğ edilir ve borçluya 7 gün süre tanınır.',
        order: 1,
      },
      {
        topicId: createdIcraTopics[0].id,
        title: 'İtiraz ve İtirazın İncelenmesi',
        content: 'Borçlu, icra emrine karşı 7 gün içinde itiraz edebilir. İtiraz, icra mahkemesinde incelenir. İtiraz geçerli görülürse icra takibi durdurulur, geçersiz görülürse takip devam eder.',
        order: 2,
      },
      {
        topicId: createdIcraTopics[0].id,
        title: 'Haciz İşlemi',
        content: 'Haciz, borçlunun mal varlığına el konulması işlemidir. Haciz işlemi, ödeme emri tebliğ edildikten sonra borçlu ödeme yapmadığında yapılır. Haciz edilen mallar satışa çıkarılır ve alacak tahsil edilir.',
        order: 3,
      },
      {
        topicId: createdIcraTopics[1].id,
        title: 'Dava Açma ve Dava Dilekçesi',
        content: 'Dava açma, hukuki uyuşmazlıkların çözümü için başvurulan yoldur. Dava dilekçesinde tarafların adları, dava konusu ve talep açıkça belirtilmelidir. Dava, zamanaşımı süresi içinde açılmalıdır.',
        order: 1,
      },
      {
        topicId: createdIcraTopics[1].id,
        title: 'Delil Toplama ve İspat',
        content: 'Delil toplama işlemi dava açılmadan önce ve duruşma sırasında yapılabilir. İspat yükü, genel olarak iddia eden tarafa aittir. Deliller, belge, tanık, bilirkişi ve keşif gibi yollarla toplanabilir.',
        order: 2,
      },
      {
        topicId: createdIcraTopics[2].id,
        title: 'Sözleşmenin Geçerliliği',
        content: 'Sözleşmenin geçerliliği için tarafların irade beyanı, sözleşme konusunun mümkün ve hukuka uygun olması gerekir. Yazılı şekil şartı her zaman gerekli değildir, bazı sözleşmeler sözlü olarak da geçerli olabilir.',
        order: 1,
      },
      {
        topicId: createdIcraTopics[2].id,
        title: 'Temerrüt ve Faiz',
        content: 'Temerrüt, borçlunun borcunu zamanında ödememesi durumudur. Faiz oranı sözleşmede belirtilirse o oran, belirtilmezse kanunda belirtilen oran uygulanır. Genel zamanaşımı süresi 10 yıldır.',
        order: 2,
      },
      {
        topicId: createdIcraTopics[3].id,
        title: 'Kişilik ve Ehliyet',
        content: 'Kişilik, doğumla başlar. Ehliyetsizlik durumunda vasi veya kayyım temsil eder. Mülkiyet hakkı asli veya fer\'i yollarla kazanılabilir. Taşınmaz satışında sözleşme ve tapu tescil işlemi gereklidir.',
        order: 1,
      },
      {
        topicId: createdIcraTopics[4].id,
        title: 'İcra Müdürünün Atanması ve Görevleri',
        content: 'İcra müdürü Adalet Bakanlığı tarafından atanır. İcra müdürü, icra takiplerini yürütmek, haciz yapmak ve satış işlemlerini gerçekleştirmek yetkisine sahiptir. İcra müdürlüğü İcra Mahkemesi\'ne bağlıdır.',
        order: 1,
      },
    ];

    for (const article of icraArticles) {
      const existing = await prisma.article.findFirst({
        where: {
          topicId: article.topicId,
          title: article.title,
        },
      });

      if (!existing) {
        await prisma.article.create({
          data: article,
        });
        console.log('✅ Konu anlatımı oluşturuldu:', article.title);
      } else {
        console.log('ℹ️ Konu anlatımı zaten mevcut:', article.title);
      }
    }

    // Her konu için özet (Summary) ekle
    const icraSummaries = [
      {
        topicId: createdIcraTopics[0].id,
        title: 'İcra Takibi Özeti',
        content: 'İcra takibi, alacaklının borçludan alacağını tahsil etmek için başvurduğu hukuki yoldur. İcra emri, alacak belgesi ve borçlunun adresi gereklidir. İtiraz süresi 7 gündür. Haciz işlemi ödeme emri tebliğ edildikten sonra yapılır.',
        order: 1,
      },
      {
        topicId: createdIcraTopics[1].id,
        title: 'Dava Süreci Özeti',
        content: 'Dava açma, hukuki uyuşmazlıkların çözümü için başvurulan yoldur. Dava dilekçesinde tarafların adları, dava konusu ve talep belirtilmelidir. Temyiz süresi 15 gündür. İstinaf başvurusu Bölge Adliye Mahkemesi\'ne yapılır.',
        order: 1,
      },
      {
        topicId: createdIcraTopics[2].id,
        title: 'Borçlar Hukuku Özeti',
        content: 'Sözleşmenin geçerliliği için tarafların irade beyanı, sözleşme konusunun mümkün ve hukuka uygun olması gerekir. Temerrüt, borçlunun borcunu zamanında ödememesi durumudur. Genel zamanaşımı süresi 10 yıldır.',
        order: 1,
      },
      {
        topicId: createdIcraTopics[3].id,
        title: 'Medeni Hukuk Özeti',
        content: 'Kişilik doğumla başlar. Ehliyetsizlik durumunda vasi veya kayyım temsil eder. Mülkiyet hakkı asli veya fer\'i yollarla kazanılabilir. Evlilik yaşı 18\'dir.',
        order: 1,
      },
      {
        topicId: createdIcraTopics[4].id,
        title: 'İcra Müdürlüğü Özeti',
        content: 'İcra müdürü Adalet Bakanlığı tarafından atanır. İcra müdürü, icra takiplerini yürütmek, haciz yapmak ve satış işlemlerini gerçekleştirmek yetkisine sahiptir. İcra müdürlüğü İcra Mahkemesi\'ne bağlıdır.',
        order: 1,
      },
    ];

    for (const summary of icraSummaries) {
      const existing = await prisma.summary.findFirst({
        where: {
          topicId: summary.topicId,
          title: summary.title,
        },
      });

      if (!existing) {
        await prisma.summary.create({
          data: summary,
        });
        console.log('✅ Özet oluşturuldu:', summary.title);
      } else {
        console.log('ℹ️ Özet zaten mevcut:', summary.title);
      }
    }

    console.log('✅ İcra Müdür Yardımcılığı Sınavı için veri eklendi!');
  } else {
    console.log('⚠️ İcra Müdür Yardımcılığı Sınavı bulunamadı!');
  }

  console.log('✅ Seed data başarıyla yüklendi!');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
