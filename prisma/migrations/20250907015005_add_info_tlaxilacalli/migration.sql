/*
  Warnings:

  - You are about to drop the column `createdById` on the `companeros` table. All the data in the column will be lost.
  - You are about to drop the column `id_departamento` on the `companeros` table. All the data in the column will be lost.
  - You are about to drop the column `facturas` on the `financieros` table. All the data in the column will be lost.
  - You are about to drop the column `id_companeros` on the `financieros` table. All the data in the column will be lost.
  - You are about to drop the column `validez` on the `financieros` table. All the data in the column will be lost.
  - You are about to drop the `departamentos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `torres` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `id_compañeros` to the `financieros` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `companeros` DROP FOREIGN KEY `companeros_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `companeros` DROP FOREIGN KEY `companeros_id_departamento_fkey`;

-- DropForeignKey
ALTER TABLE `departamentos` DROP FOREIGN KEY `departamentos_id_torre_fkey`;

-- DropForeignKey
ALTER TABLE `financieros` DROP FOREIGN KEY `financieros_id_companeros_fkey`;

-- DropIndex
DROP INDEX `companeros_createdById_fkey` ON `companeros`;

-- DropIndex
DROP INDEX `companeros_id_departamento_fkey` ON `companeros`;

-- DropIndex
DROP INDEX `financieros_id_companeros_fkey` ON `financieros`;

-- AlterTable
ALTER TABLE `companeros` DROP COLUMN `createdById`,
    DROP COLUMN `id_departamento`;

-- AlterTable
ALTER TABLE `financieros` DROP COLUMN `facturas`,
    DROP COLUMN `id_companeros`,
    DROP COLUMN `validez`,
    ADD COLUMN `faenas` VARCHAR(255) NULL,
    ADD COLUMN `id_compañeros` VARCHAR(191) NOT NULL,
    ADD COLUMN `veladas` VARCHAR(255) NULL;

-- DropTable
DROP TABLE `departamentos`;

-- DropTable
DROP TABLE `torres`;

-- DropTable
DROP TABLE `users`;

-- CreateTable
CREATE TABLE `info_tlaxilacalli` (
    `id_Tlax` VARCHAR(191) NOT NULL,
    `Excedente` INTEGER NULL,
    `Aport` INTEGER NULL,
    `Deuda` INTEGER NULL,
    `Estacionamiento` INTEGER NULL,
    `Aportacion` INTEGER NULL,
    `Aportacion_Deuda` INTEGER NULL,
    `Apoyo_renta` VARCHAR(255) NULL,
    `Comentarios` VARCHAR(255) NULL,
    `id_compañeros` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `info_tlaxilacalli_id_compañeros_key`(`id_compañeros`),
    PRIMARY KEY (`id_Tlax`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `info_tlaxilacalli` ADD CONSTRAINT `info_tlaxilacalli_id_compañeros_fkey` FOREIGN KEY (`id_compañeros`) REFERENCES `companeros`(`id_companero`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financieros` ADD CONSTRAINT `financieros_id_compañeros_fkey` FOREIGN KEY (`id_compañeros`) REFERENCES `companeros`(`id_companero`) ON DELETE CASCADE ON UPDATE CASCADE;
