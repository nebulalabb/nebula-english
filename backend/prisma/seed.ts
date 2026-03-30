import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('NebulaLab Seed started...');

  // --- 1. Tạo các Plan Subscriptions ---
  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'free' },
    update: {},
    create: {
      name: 'free',
      displayName: 'Miễn phí',
      priceVnd: 0,
      billingCycle: null,
      features: {
        flashcard_limit: 20,
        solver_daily_limit: 5,
        summary_daily_limit: 3,
        quiz_daily_limit: 1,
        ai_model: 'gemini-1.5-flash',
        storage_mb: 100
      },
      sortOrder: 1
    }
  });

  const premiumMonthly = await prisma.subscriptionPlan.upsert({
    where: { name: 'premium_monthly' },
    update: {},
    create: {
      name: 'premium_monthly',
      displayName: 'Premium Tháng',
      priceVnd: 99000,
      billingCycle: 'monthly',
      features: {
        flashcard_limit: -1,
        solver_daily_limit: -1,
        summary_daily_limit: -1,
        quiz_daily_limit: -1,
        ai_model: 'gemini-1.5-pro',
        storage_mb: 5000
      },
      sortOrder: 2
    }
  });

  const premiumYearly = await prisma.subscriptionPlan.upsert({
    where: { name: 'premium_yearly' },
    update: {},
    create: {
      name: 'premium_yearly',
      displayName: 'Premium Năm',
      priceVnd: 799000,
      billingCycle: 'yearly',
      features: {
        flashcard_limit: -1,
        solver_daily_limit: -1,
        summary_daily_limit: -1,
        quiz_daily_limit: -1,
        ai_model: 'gemini-1.5-pro',
        storage_mb: 10000
      },
      sortOrder: 3
    }
  });

  console.log('Seeded Subscription Plans');

  // --- 2. Tạo Admin User ---
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'nhoangkha03@gmail.com' },
    update: {
      passwordHash: adminPasswordHash,
      role: 'admin',
      plan: 'premium',
    },
    create: {
      email: 'nhoangkha03@gmail.com',
      passwordHash: adminPasswordHash,
      fullName: 'Nguyễn Hoàng Kha (Admin)',
      role: 'admin',
      plan: 'premium',
      emailVerified: true
    },
  });

  // Assign Subscription cho admin
  await prisma.subscription.create({
    data: {
      userId: adminUser.id,
      planId: premiumYearly.id,
      status: 'active',
      expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 10)) // 10 năm
    }
  });

  console.log(`Seeded Admin User: ${adminUser.email}`);
  
  // --- Created Tutor ---
  const tutorPasswordHash = await bcrypt.hash('tutor123', 10);
  const tutor1 = await prisma.user.upsert({
    where: { email: 'tutor1@nebula.com' },
    update: {
      passwordHash: tutorPasswordHash,
      role: 'tutor'
    },
    create: {
      email: 'tutor1@nebula.com',
      passwordHash: tutorPasswordHash,
      fullName: 'Phan Minh Tutor',
      role: 'tutor',
      plan: 'free',
      emailVerified: true
    }
  });

  // --- Created Student ---
  const studentPasswordHash = await bcrypt.hash('student123', 10);
  const student1 = await prisma.user.upsert({
    where: { email: 'student1@nebula.com' },
    update: {
      passwordHash: studentPasswordHash,
    },
    create: {
      email: 'student1@nebula.com',
      passwordHash: studentPasswordHash,
      fullName: 'Nguyen Van Student',
      role: 'student',
      plan: 'free',
      emailVerified: true
    }
  });

  // --- 3. Tạo Base Topics cho Micro-learning ---
  const topics = [
    { name: 'Tiếng Anh giao tiếp', slug: 'tieng-anh-giao-tiep', description: 'Giao tiếp hàng ngày, từ vựng theo tình huống' },
    { name: 'Toán học vui', slug: 'toan-hoc-vui', description: 'Khám phá toán học qua các câu đố thú vị' },
    { name: 'Kỹ năng mềm', slug: 'ky-nang-mem', description: 'Giao tiếp, thuyết trình, quản lý thời gian' }
  ];

  for (const t of topics) {
    await prisma.learningTopic.upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        ...t,
        isActive: true
      }
    });
  }

  console.log('Seeded Micro-learning Topics');

  // --- 4. Tạo Dữ Liệu Thực Tế Cho Các Module AI ---

  // 4.1. Flashcards (AI Generated)
  await prisma.flashcardSet.create({
    data: {
      userId: adminUser.id,
      title: '100 Từ Vựng IELTS Cốt Lõi',
      description: 'Được tạo bởi AI dựa trên corpus IELTS',
      subject: 'Tiếng Anh',
      sourceType: 'ai_generated',
      cardCount: 2,
      isPublic: true,
      flashcards: {
        create: [
          { front: 'Ubiquitous', back: 'Có mặt ở khắp mọi nơi', hint: 'u-bi-qui-tous', sortOrder: 1 },
          { front: 'Ephemeral', back: 'Phù du, ngắn ngủi', hint: 'e-phem-er-al', sortOrder: 2 },
        ]
      }
    }
  });

  // 4.2. Giải Bài Tập Bằng AI (SolveHistory)
  await prisma.solveHistory.create({
    data: {
      userId: adminUser.id,
      subject: 'Toán học',
      gradeLevel: 'Lớp 12',
      questionText: 'Tính tích phân của e^x từ 0 đến 1',
      answerText: 'Tích phân của e^x là e^x. Tại cận 1 và 0, giá trị là e^1 - e^0 = e - 1.',
      answerHtml: '<p>Tích phân của <strong>e^x</strong> là <strong>e^x</strong>. Tại cận 1 và 0, giá trị là e^1 - e^0 = e - 1.</p>',
      tokensUsed: 150,
      modelUsed: 'gemini-1.5-pro',
      isSaved: true
    }
  });

  // 4.3. Đề Thi Tự Động (AI Generated Exam)
  await prisma.exam.create({
    data: {
      creatorId: adminUser.id,
      title: 'Đề thi thử THPT Quốc Gia môn Toán 2026',
      description: 'Đề thi được tạo tự động bởi AI, sát với cấu trúc đề minh họa.',
      subject: 'Toán học',
      gradeLevel: 'Lớp 12',
      durationMinutes: 90,
      totalQuestions: 2,
      totalPoints: 10,
      isAiGenerated: true,
      isPublic: true,
      questions: {
        create: [
          {
            questionText: 'Hàm số nào dưới đây đồng biến trên R?',
            questionType: 'single_choice',
            options: ['y = x^3 - 3x', 'y = x^4 + x^2', 'y = 2x + 1', 'y = (x+1)/(x-1)'],
            correctAnswers: ['y = 2x + 1'],
            explanation: 'Hàm bậc nhất y = ax + b có đạo hàm y\' = a. Nếu a > 0 thì hàm số đồng biến trên R. Ở đây a = 2 > 0.',
            points: 5,
            sortOrder: 1
          },
          {
            questionText: 'Cho hình chóp S.ABC có đáy là tam giác vuông cân tại B. Cạnh bên SA vuông góc với đáy. Khẳng định nào sau đây đúng?',
            questionType: 'single_choice',
            options: ['(SAB) vuông góc (SBC)', '(SAC) vuông góc (SBC)', 'SAB là tam giác đều', 'SC vuông góc AB'],
            correctAnswers: ['(SAB) vuông góc (SBC)'],
            explanation: 'SBC vuông góc với SAB vì BC vuông góc AB và BC vuông góc SA.',
            points: 5,
            sortOrder: 2
          }
        ]
      }
    }
  });

  // 4.4. Bài Học Micro-learning (Daily Lesson)
  const englishTopic = await prisma.learningTopic.findUnique({ where: { slug: 'tieng-anh-giao-tiep' } });
  if (englishTopic) {
    await prisma.dailyLesson.create({
      data: {
        topicId: englishTopic.id,
        title: 'Cách chào hỏi tự nhiên như người bản xứ',
        content: 'Thay vì nói How are you, hãy thử What\'s up hoặc How\'s it going...',
        contentHtml: '<p>Thay vì nói <strong>How are you</strong>, hãy thử <strong>What\'s up</strong> hoặc <strong>How\'s it going</strong>...</p>',
        estimatedMinutes: 5,
        dayIndex: 1,
        isPremium: false,
        quizQuestion: {
          question: 'Câu nào sau đây thân mật hơn "How are you"?',
          options: ['How do you do?', 'What\'s up?', 'Are you well?'],
          correct: 'What\'s up?'
        }
      }
    });
  }

  // 4.5. AI Notes & Summaries
  await prisma.note.create({
    data: {
      userId: adminUser.id,
      title: 'Lịch sử hình thành AI',
      sourceType: 'text',
      sourceContent: 'Trí tuệ nhân tạo (AI) bắt đầu vào những năm 1950 với phép thử Turing. Sau nhiều "mùa đông AI", nó đã bùng nổ nhờ học sâu và phần cứng mạnh mẽ...',
      wordCount: 300,
      tags: ['AI', 'History'],
      summaries: {
        create: [
          {
            summaryShort: 'Tóm tắt sự phát triển của AI từ 1950s.',
            bulletPoints: ['Bắt đầu 1950 với Turing test', 'Trải qua mùa đông AI', 'Bùng nổ nhờ Deep Learning'],
            keywords: ['Trí tuệ nhân tạo', 'Turing', 'Deep Learning'],
            modelUsed: 'gemini-1.5-pro',
            tokensUsed: 400
          }
        ]
      }
    }
  });

  // 4.6. AI Quiz Generator
  await prisma.quizSet.create({
    data: {
      userId: adminUser.id,
      title: 'Quiz Nhanh: Kiến thức vũ trụ cơ bản',
      description: 'Kiểm tra xem bạn biết bao nhiêu về hệ mặt trời!',
      questionCount: 2,
      difficulty: 'easy',
      isPublic: true,
      questions: {
        create: [
          {
            questionText: 'Hành tinh nào gần mặt trời nhất?',
            questionType: 'single_choice',
            options: ['Sao Kim', 'Sao Thủy', 'Trái Đất', 'Sao Hỏa'],
            correctAnswers: ['Sao Thủy'],
            points: 10,
            sortOrder: 1
          },
          {
            questionText: 'Mặt trời là một hành tinh. Đúng hay sai?',
            questionType: 'true_false',
            options: ['Đúng', 'Sai'],
            correctAnswers: ['Sai'],
            explanation: 'Mặt trời là một ngôi sao, không phải hành tinh.',
            points: 10,
            sortOrder: 2
          }
        ]
      }
    }
  });

  console.log('✅ Created Learning Topics & Lessons')

  // --------------------------------------------------------------------------------
  // 9. FORUM SEED (NEW)
  // --------------------------------------------------------------------------------
  console.log('Seeding Forum Categories & Posts...')

  const cats = await Promise.all([
    prisma.forumCategory.create({ data: { name: 'Thảo luận chung', slug: 'thao-luan-chung', icon: '🗣️', color: 'blue' } }),
    prisma.forumCategory.create({ data: { name: 'Chia sẻ kinh nghiệm', slug: 'chia-se-kinh-nghiem', icon: '💡', color: 'yellow' } }),
    prisma.forumCategory.create({ data: { name: 'Tài liệu học tập', slug: 'tai-lieu-hoc-tap', icon: '📚', color: 'green' } }),
    prisma.forumCategory.create({ data: { name: 'Hỏi đáp bài tập', slug: 'hoi-dap-bai-tap', icon: '❓', color: 'purple' } }),
  ])

  const forumPost1 = await prisma.forumPost.create({
    data: {
      categoryId: cats[1].id,
      authorId: student1.id,
      title: 'Làm sao để nhớ từ vựng hiệu quả mà không mau quên?',
      content: 'Chào mọi người, mình gặp khó khăn trong việc ghi nhớ từ vựng. Cứ học hôm nay là ngày mốt quên sạch. Mọi người có phương pháp nào hiệu quả không chia sẻ giúp mình với ạ?',
      viewCount: 156,
      upvotes: 45,
      isPinned: true
    }
  })

  await prisma.forumComment.create({
    data: {
      postId: forumPost1.id,
      authorId: tutor1.id,
      content: 'Chào bạn, bạn nên áp dụng phương pháp Spaced Repetition (Lặp lại ngắt quãng). Trên NebulaLab có tính năng Học Từ Vựng Flashcard có tích hợp AI, nó sẽ tự nhắc bạn ôn lại khi nào sắp quên. Bạn thử nha!',
      upvotes: 12,
      isSolution: true
    }
  })

  await prisma.forumPost.create({
    data: {
      categoryId: cats[2].id,
      authorId: tutor1.id,
      title: '[Share] Tổng hợp 1000 từ vựng IELTS cốt lõi 2026',
      content: 'Mình vừa tổng hợp xong bộ từ vựng IELTS mới nhất update theo xu hướng đề thi năm nay. Các bạn tham khảo nhé...',
      viewCount: 340,
      upvotes: 89
    }
  })

  console.log('✅ Created Forum Data')

  console.log('🎉 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
