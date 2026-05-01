'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SaveLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SaveLimitModal({ isOpen, onClose }: SaveLimitModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#15151A] border-[rgba(255,255,255,0.08)] text-[#E8E6F0] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#E8E6F0]">Save limit reached</DialogTitle>
          <DialogDescription className="text-[#B4B2A9]">
            You&apos;ve reached your save limit. Delete an old search to save this one.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={onClose}
            className="bg-[#7F77DD] hover:bg-[#6B63C7] text-[#0F0F12]"
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
