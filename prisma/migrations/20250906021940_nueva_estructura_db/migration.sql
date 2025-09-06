-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'RESIDENT') NOT NULL DEFAULT 'RESIDENT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `torres` (
    `id_torre` VARCHAR(191) NOT NULL,
    `letra` VARCHAR(191) NOT NULL,
    `nivel` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `torres_letra_key`(`letra`),
    PRIMARY KEY (`id_torre`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departamentos` (
    `id_departamento` VARCHAR(191) NOT NULL,
    `no_departamento` VARCHAR(191) NOT NULL,
    `id_torre` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `departamentos_no_departamento_id_torre_key`(`no_departamento`, `id_torre`),
    PRIMARY KEY (`id_departamento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `companeros` (
    `id_companero` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellidos` VARCHAR(191) NOT NULL,
    `fecha_nacimiento` DATETIME(3) NULL,
    `no_personas` INTEGER NULL,
    `no_des_per` INTEGER NULL DEFAULT 0,
    `recibo_apoyo` VARCHAR(10) NULL,
    `no_apoyo` INTEGER NULL,
    `id_departamento` VARCHAR(191) NULL,
    `estatus` ENUM('ACTIVO', 'SUSPENDIDO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_companero`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `info_financiero` (
    `id_flux` VARCHAR(191) NOT NULL,
    `excelente` VARCHAR(10) NULL,
    `aport` VARCHAR(10) NULL,
    `deuda` VARCHAR(10) NULL,
    `estacionamiento` VARCHAR(10) NULL,
    `aportacion` VARCHAR(10) NULL,
    `aportacion_deuda` VARCHAR(10) NULL,
    `apoyo_renta` VARCHAR(10) NULL,
    `comentarios` TEXT NULL,
    `id_companeros` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `info_financiero_id_companeros_key`(`id_companeros`),
    PRIMARY KEY (`id_flux`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `financieros` (
    `id_financieros` VARCHAR(191) NOT NULL,
    `validez` VARCHAR(255) NULL,
    `aportaciones` VARCHAR(255) NULL,
    `facturas` VARCHAR(255) NULL,
    `salidas` VARCHAR(255) NULL,
    `id_companeros` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_financieros`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `departamentos` ADD CONSTRAINT `departamentos_id_torre_fkey` FOREIGN KEY (`id_torre`) REFERENCES `torres`(`id_torre`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `companeros` ADD CONSTRAINT `companeros_id_departamento_fkey` FOREIGN KEY (`id_departamento`) REFERENCES `departamentos`(`id_departamento`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `companeros` ADD CONSTRAINT `companeros_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `info_financiero` ADD CONSTRAINT `info_financiero_id_companeros_fkey` FOREIGN KEY (`id_companeros`) REFERENCES `companeros`(`id_companero`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financieros` ADD CONSTRAINT `financieros_id_companeros_fkey` FOREIGN KEY (`id_companeros`) REFERENCES `companeros`(`id_companero`) ON DELETE CASCADE ON UPDATE CASCADE;
