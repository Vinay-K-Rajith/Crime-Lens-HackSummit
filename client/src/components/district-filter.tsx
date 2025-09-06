import { Button } from "@/components/ui/button";
import type { District } from "@shared/schema";

interface DistrictFilterProps {
  districts: District[];
  selectedDistrict: string;
  onDistrictChange: (districtId: string) => void;
}

export function DistrictFilter({ districts, selectedDistrict, onDistrictChange }: DistrictFilterProps) {
  return (
    <div className="space-y-3">
      <Button
        className={`w-full text-left justify-start px-3 py-2 text-sm font-medium ${
          selectedDistrict === 'all' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
        onClick={() => onDistrictChange('all')}
        data-testid="button-district-all"
      >
        All Districts
      </Button>
      
      {districts.map((district) => (
        <Button
          key={district.id}
          className={`w-full text-left justify-start px-3 py-2 text-sm ${
            selectedDistrict === district.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
          onClick={() => onDistrictChange(district.id)}
          data-testid={`button-district-${district.id}`}
        >
          {district.name}
        </Button>
      ))}
    </div>
  );
}
