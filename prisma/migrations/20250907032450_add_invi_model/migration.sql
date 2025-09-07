-- CreateTable
CREATE TABLE `invi` (
    `id_invi` INTEGER NOT NULL AUTO_INCREMENT,
    `Mensualidades` VARCHAR(191) NULL,
    `fecha_de_contrato` VARCHAR(191) NULL,
    `deuda` INTEGER NULL,
    `id_companero` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `invi_id_companero_key`(`id_companero`),
    PRIMARY KEY (`id_invi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `invi` ADD CONSTRAINT `invi_id_companero_fkey` FOREIGN KEY (`id_companero`) REFERENCES `companeros`(`id_companero`) ON DELETE CASCADE ON UPDATE CASCADE;
