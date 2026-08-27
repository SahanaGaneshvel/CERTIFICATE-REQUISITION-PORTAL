-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "CollectionMode" AS ENUM ('APPLICANT_IN_PERSON', 'APPLICANT_BY_POST', 'AUTHORIZED_IN_PERSON', 'AUTHORIZED_BY_POST');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPLIED', 'PROCESSING', 'READY', 'COLLECTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "CertificateRequestStatus" AS ENUM ('PENDING', 'GENERATED', 'DOWNLOADED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "registerNo" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "campus" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "admittedYear" INTEGER NOT NULL,
    "institution" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL DEFAULT '',
    "alternateMobile" TEXT,
    "email" TEXT NOT NULL DEFAULT '',
    "alternateEmail" TEXT,
    "isRegistered" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranscriptApplication" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "numberOfSets" INTEGER NOT NULL,
    "notSealed" INTEGER NOT NULL,
    "sealed" INTEGER NOT NULL,
    "totalEnvelopes" INTEGER NOT NULL,
    "collectionMode" "CollectionMode" NOT NULL,
    "authorizedName" TEXT,
    "authorizedRelationship" TEXT,
    "authorizedAddress" TEXT,
    "authorizedMobile" TEXT,
    "applicantIdProofKey" TEXT,
    "markSheetKey" TEXT,
    "authorizedIdProofKey" TEXT,
    "authorizationLetterKey" TEXT,
    "generatedCertificateKey" TEXT,
    "feeAmount" DOUBLE PRECISION NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranscriptApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificateRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "certificateType" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" "CertificateRequestStatus" NOT NULL DEFAULT 'PENDING',
    "feeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "generatedCertificateKey" TEXT,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificateRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "srmTransId" TEXT NOT NULL,
    "pgTransId" TEXT,
    "studentId" TEXT NOT NULL,
    "feeType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "dateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transcriptApplicationId" TEXT,
    "certificateRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_registerNo_key" ON "User"("registerNo");

-- CreateIndex
CREATE UNIQUE INDEX "TranscriptApplication_referenceNumber_key" ON "TranscriptApplication"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_srmTransId_key" ON "Payment"("srmTransId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transcriptApplicationId_key" ON "Payment"("transcriptApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_certificateRequestId_key" ON "Payment"("certificateRequestId");

-- AddForeignKey
ALTER TABLE "TranscriptApplication" ADD CONSTRAINT "TranscriptApplication_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateRequest" ADD CONSTRAINT "CertificateRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_transcriptApplicationId_fkey" FOREIGN KEY ("transcriptApplicationId") REFERENCES "TranscriptApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_certificateRequestId_fkey" FOREIGN KEY ("certificateRequestId") REFERENCES "CertificateRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
