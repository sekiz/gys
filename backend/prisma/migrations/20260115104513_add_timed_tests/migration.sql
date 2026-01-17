-- CreateTable
CREATE TABLE "timed_tests" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "topicId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timed_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timed_test_questions" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timed_test_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timed_test_results" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timed_test_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "timed_test_questions_testId_order_idx" ON "timed_test_questions"("testId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "timed_test_questions_testId_questionId_key" ON "timed_test_questions"("testId", "questionId");

-- CreateIndex
CREATE INDEX "timed_test_results_userId_testId_idx" ON "timed_test_results"("userId", "testId");

-- CreateIndex
CREATE INDEX "timed_test_results_testId_idx" ON "timed_test_results"("testId");

-- AddForeignKey
ALTER TABLE "timed_tests" ADD CONSTRAINT "timed_tests_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timed_tests" ADD CONSTRAINT "timed_tests_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timed_test_questions" ADD CONSTRAINT "timed_test_questions_testId_fkey" FOREIGN KEY ("testId") REFERENCES "timed_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timed_test_questions" ADD CONSTRAINT "timed_test_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timed_test_results" ADD CONSTRAINT "timed_test_results_testId_fkey" FOREIGN KEY ("testId") REFERENCES "timed_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timed_test_results" ADD CONSTRAINT "timed_test_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
