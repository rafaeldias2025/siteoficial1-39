import React from "react";
import { Card } from "@/components/ui/card";
import { useDadosFisicos } from "@/hooks/useDadosFisicos";

export const SilhuetaCentralizada = () => {
  const { dadosFisicos, loading } = useDadosFisicos();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-pulse bg-muted rounded-lg w-64 h-96"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-8">
      <Card className="p-6 bg-card border border-border max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
          Seus Dados Físicos
        </h2>
        {dadosFisicos && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="bg-muted/50 p-4 rounded-lg">
                <span className="font-medium text-muted-foreground">IMC:</span>
                <span className="ml-2 text-foreground text-lg">
                  {dadosFisicos.imc?.toFixed(1)} ({dadosFisicos.categoria_imc})
                </span>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <span className="font-medium text-muted-foreground">Risco Cardiometabólico:</span>
                <span className="ml-2 text-foreground text-lg">
                  {dadosFisicos.risco_cardiometabolico}
                </span>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <span className="font-medium text-muted-foreground">Peso:</span>
                <span className="ml-2 text-foreground text-lg">
                  {dadosFisicos.peso_atual_kg} kg
                </span>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <span className="font-medium text-muted-foreground">Altura:</span>
                <span className="ml-2 text-foreground text-lg">
                  {dadosFisicos.altura_cm} cm
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};