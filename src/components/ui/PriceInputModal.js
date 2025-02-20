import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './custom-dialog-components';
import { Input } from './input';
import { Button } from './button';

const PriceInputModal = ({ isOpen, onClose, onConfirm, todoText }) => {
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // Remove any leading/trailing whitespace
    const trimmedPrice = price.trim();

    // Validate if empty
    if (!trimmedPrice) {
      setError('Fiyat alanı boş bırakılamaz');
      return;
    }

    // Validate if it's a valid number (integer or decimal)
    const isValidNumber = /^\d*\.?\d+$/.test(trimmedPrice);
    
    if (!isValidNumber) {
      setError('Lütfen geçerli bir sayı giriniz (örn: 5 veya 5.5)');
      return;
    }

    // Clear error and call onConfirm with the validated price
    setError('');
    onConfirm(parseFloat(trimmedPrice));
  };

  const handleClose = () => {
    setPrice('');
    setError('');
    onClose();
  };

  // Check if price is empty or contains only whitespace
  const isSubmitDisabled = !price.trim();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Arşivleme Fiyatı</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            "{todoText}" görevi için fiyat giriniz
          </p>
          <Input
            type="number"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              setError('');
            }}
            placeholder="Fiyat (TL)"
            className={error ? 'border-red-500' : ''}
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            İptal
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
          >
            Onayla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PriceInputModal;