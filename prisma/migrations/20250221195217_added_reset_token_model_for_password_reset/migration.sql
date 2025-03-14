-- CreateTable
CREATE TABLE "resetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resetToken_token_key" ON "resetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "resetToken_userId_key" ON "resetToken"("userId");

-- AddForeignKey
ALTER TABLE "resetToken" ADD CONSTRAINT "resetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
