-- CreateTable
CREATE TABLE `niveles` (
    `id_nivel` VARCHAR(191) NOT NULL,
    `numero` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NULL,
    `id_torre` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `niveles_id_torre_numero_key`(`id_torre`, `numero`),
    PRIMARY KEY (`id_nivel`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departamentos_nivel` (
    `id` VARCHAR(191) NOT NULL,
    `id_departamento` VARCHAR(191) NOT NULL,
    `id_nivel` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `departamentos_nivel_id_departamento_id_nivel_key`(`id_departamento`, `id_nivel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `niveles` ADD CONSTRAINT `niveles_id_torre_fkey` FOREIGN KEY (`id_torre`) REFERENCES `torres`(`id_torre`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `departamentos_nivel` ADD CONSTRAINT `departamentos_nivel_id_departamento_fkey` FOREIGN KEY (`id_departamento`) REFERENCES `departamentos`(`id_departamento`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `departamentos_nivel` ADD CONSTRAINT `departamentos_nivel_id_nivel_fkey` FOREIGN KEY (`id_nivel`) REFERENCES `niveles`(`id_nivel`) ON DELETE CASCADE ON UPDATE CASCADE;
