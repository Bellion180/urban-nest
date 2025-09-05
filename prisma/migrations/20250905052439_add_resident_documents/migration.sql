-- AlterTable
ALTER TABLE `residents` ADD COLUMN `documentoActaNacimiento` VARCHAR(191) NULL,
    ADD COLUMN `documentoComprobanteDomicilio` VARCHAR(191) NULL,
    ADD COLUMN `documentoCurp` VARCHAR(191) NULL,
    ADD COLUMN `documentoIne` VARCHAR(191) NULL;
