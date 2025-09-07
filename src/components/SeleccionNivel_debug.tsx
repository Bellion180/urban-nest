import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const SeleccionNivel = () => {
  const { buildingId } = useParams<{ buildingId: string }>();
  const navigate = useNavigate();

  console.log('SeleccionNivel montado con buildingId:', buildingId);

  return (
    <div className="min-h-screen bg-background p-4">
      <h1 className="text-2xl font-bold mb-4">Selección de Nivel - DEBUG</h1>
      <p>Building ID: {buildingId}</p>
      <button 
        onClick={() => navigate('/dashboard')}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      >
        Volver al Dashboard
      </button>
    </div>
  );
};
