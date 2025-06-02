import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Professional } from '@/types';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    // Fetch professionals data
  }, []);

  return (
    <div className="space-y-4">
      {professionals.map((professional) => (
        <div key={professional.id} className="flex items-center justify-between">
          {/* Professional details */}
          <Button onClick={() => navigate('/admin/pending')} className="bg-gradient-to-r from-brand to-blue-500 hover:from-brand/90 hover:to-blue-500/90 text-white border-0 shadow">
            Revisar
          </Button>
        </div>
      ))}
    </div>
  );
};

export default DashboardPage; 