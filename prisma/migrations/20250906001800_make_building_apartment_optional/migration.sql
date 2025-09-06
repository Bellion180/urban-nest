-- DropForeignKey
ALTER TABLE `residents` DROP FOREIGN KEY `residents_apartmentId_fkey`;

-- DropForeignKey
ALTER TABLE `residents` DROP FOREIGN KEY `residents_buildingId_fkey`;

-- DropIndex
DROP INDEX `residents_apartmentId_fkey` ON `residents`;

-- DropIndex
DROP INDEX `residents_buildingId_fkey` ON `residents`;

-- AlterTable
ALTER TABLE `residents` MODIFY `buildingId` VARCHAR(191) NULL,
    MODIFY `apartmentId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `residents` ADD CONSTRAINT `residents_buildingId_fkey` FOREIGN KEY (`buildingId`) REFERENCES `buildings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `residents` ADD CONSTRAINT `residents_apartmentId_fkey` FOREIGN KEY (`apartmentId`) REFERENCES `apartments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
