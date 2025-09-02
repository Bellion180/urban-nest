-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'RESIDENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "floors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "buildingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "floors_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "apartments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "floorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "apartments_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "floors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "residents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "edad" INTEGER,
    "email" TEXT,
    "telefono" TEXT,
    "fechaNacimiento" DATETIME,
    "noPersonas" INTEGER,
    "discapacidad" BOOLEAN NOT NULL DEFAULT false,
    "profilePhoto" TEXT,
    "estatus" TEXT NOT NULL DEFAULT 'ACTIVO',
    "hasKey" BOOLEAN NOT NULL DEFAULT false,
    "registrationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "buildingId" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "deudaActual" REAL NOT NULL DEFAULT 0.00,
    "pagosRealizados" REAL NOT NULL DEFAULT 0.00,
    "informe" TEXT,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "residents_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "residents_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "apartments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "residents_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "residentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payments_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "residents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "buildings_name_key" ON "buildings"("name");

-- CreateIndex
CREATE UNIQUE INDEX "floors_buildingId_number_key" ON "floors"("buildingId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "apartments_floorId_number_key" ON "apartments"("floorId", "number");
