import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { residentService } from '@/services/api';
import { Resident } from '@/types/user';
import { 
  DollarSign, 
  CreditCard, 
  Calculator,
  Loader2,
  CheckCircle
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: Resident | null;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  resident,
  onPaymentSuccess
}) => {
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!resident || !paymentAmount) {
      toast({
        title: "Error",
        description: "Por favor ingrese un monto válido",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "El monto debe ser mayor a 0",
        variant: "destructive"
      });
      return;
    }

    if (amount > resident.deudaActual) {
      toast({
        title: "Error",
        description: "El monto no puede ser mayor a la deuda actual",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Realizar el pago
      await residentService.makePayment(resident.id, {
        amount: amount,
        paymentDate: new Date().toISOString(),
        description: `Pago de $${amount.toFixed(2)}`
      });

      toast({
        title: "Pago realizado",
        description: `Se ha registrado el pago de $${amount.toFixed(2)}`,
        variant: "default"
      });

      // Limpiar formulario
      setPaymentAmount('');
      onPaymentSuccess();
      onClose();
    } catch (error) {
      console.error('Error al realizar el pago:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar el pago. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateNewValues = () => {
    if (!resident || !paymentAmount) return null;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return null;

    const newDebt = Math.max(0, resident.deudaActual - amount);
    const newPaidAmount = (resident.pagosRealizados || 0) + amount;

    return {
      newDebt,
      newPaidAmount
    };
  };

  const projectedValues = calculateNewValues();

  if (!resident) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Realizar Pago - {resident.nombre} {resident.apellido}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información actual del residente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4" />
                Estado Financiero Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Deuda Actual</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${resident.deudaActual?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Pagos Realizados</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${resident.pagosRealizados?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulario de pago */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calculator className="h-4 w-4" />
                Monto del Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentAmount">Monto a Pagar</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={resident.deudaActual}
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Máximo: ${resident.deudaActual?.toFixed(2) || '0.00'}
                </p>
              </div>

              {/* Proyección del pago */}
              {projectedValues && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Proyección después del pago
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-blue-700 font-medium">Nueva Deuda:</p>
                      <p className="text-lg font-bold text-red-600">
                        ${projectedValues.newDebt.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">Total Pagado:</p>
                      <p className="text-lg font-bold text-green-600">
                        ${projectedValues.newPaidAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={loading || !paymentAmount || parseFloat(paymentAmount) <= 0}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Procesar Pago
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
