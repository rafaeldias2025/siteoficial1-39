import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale, Ruler } from 'lucide-react';
import { useDadosSaude, DadosSaude } from '@/hooks/useDadosSaude';

interface AtualizarMedidasModalProps {
  trigger?: React.ReactNode;
}

export const AtualizarMedidasModal: React.FC<AtualizarMedidasModalProps> = ({ trigger }) => {
  const { dadosSaude, salvarDadosSaude } = useDadosSaude();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    peso_atual_kg: dadosSaude?.peso_atual_kg || '',
    altura_cm: dadosSaude?.altura_cm || '',
    circunferencia_abdominal_cm: dadosSaude?.circunferencia_abdominal_cm || '',
    meta_peso_kg: dadosSaude?.meta_peso_kg || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dados = {
      peso_atual_kg: parseFloat(formData.peso_atual_kg.toString()),
      altura_cm: parseInt(formData.altura_cm.toString()),
      circunferencia_abdominal_cm: parseFloat(formData.circunferencia_abdominal_cm.toString()),
      meta_peso_kg: parseFloat(formData.meta_peso_kg.toString())
    };

    await salvarDadosSaude(dados);
    setOpen(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-instituto-orange hover:bg-instituto-orange/90 text-white"
            size="icon"
          >
            <Scale className="h-6 w-6" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-instituto-orange">
            <Ruler className="h-5 w-5" />
            Atualizar Medidas
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="altura">Altura (cm)</Label>
              <Input
                id="altura"
                type="number"
                value={formData.altura_cm}
                onChange={(e) => handleChange('altura_cm', e.target.value)}
                placeholder="175"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="peso">Peso Atual (kg)</Label>
              <Input
                id="peso"
                type="number"
                step="0.1"
                value={formData.peso_atual_kg}
                onChange={(e) => handleChange('peso_atual_kg', e.target.value)}
                placeholder="70.5"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="circunferencia">Circunferência Abdominal (cm)</Label>
              <Input
                id="circunferencia"
                type="number"
                step="0.1"
                value={formData.circunferencia_abdominal_cm}
                onChange={(e) => handleChange('circunferencia_abdominal_cm', e.target.value)}
                placeholder="85.0"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="meta">Meta de Peso (kg)</Label>
              <Input
                id="meta"
                type="number"
                step="0.1"
                value={formData.meta_peso_kg}
                onChange={(e) => handleChange('meta_peso_kg', e.target.value)}
                placeholder="65.0"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-instituto-orange hover:bg-instituto-orange/90"
            >
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};