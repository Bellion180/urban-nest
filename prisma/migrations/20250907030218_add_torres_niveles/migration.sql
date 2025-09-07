-- AlterTable
ALTER TABLE `departamentos` ADD COLUMN `id_nivel` VARCHAR(191) NULL,
    ADD COLUMN `id_torre` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `role` ENUM('ADMIN', 'RESIDENT') NOT NULL DEFAULT 'ADMIN';

-- CreateTable
CREATE TABLE `torres` (
    `id_torre` VARCHAR(191) NOT NULL,
    `letra` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_torre`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `niveles` (
    `id_nivel` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `numero` INTEGER NOT NULL,
    `id_torre` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_nivel`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `niveles` ADD CONSTRAINT `niveles_id_torre_fkey` FOREIGN KEY (`id_torre`) REFERENCES `torres`(`id_torre`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `departamentos` ADD CONSTRAINT `departamentos_id_torre_fkey` FOREIGN KEY (`id_torre`) REFERENCES `torres`(`id_torre`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `departamentos` ADD CONSTRAINT `departamentos_id_nivel_fkey` FOREIGN KEY (`id_nivel`) REFERENCES `niveles`(`id_nivel`) ON DELETE SET NULL ON UPDATE CASCADE;
