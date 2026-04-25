import { Link } from "react-router-dom";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import type { DoctorProfile } from "../../../shared/types/models";
import { formatCurrency, getInitials } from "../../../shared/utils/format";

interface DoctorCardProps {
  doctor: DoctorProfile;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Card className="h-full border-white/80 bg-white/95">
      <div className="flex h-full flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-lg font-semibold text-brand-700">
            {getInitials(doctor.name)}
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-900">{doctor.name}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge tone="success">{doctor.specialization}</Badge>
              <Badge>{doctor.experienceYears} yrs exp</Badge>
            </div>
          </div>
        </div>

        <p className="text-sm leading-6 text-slate-600">{doctor.about}</p>

        <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Fee</p>
            <p className="mt-1 font-semibold text-slate-900">
              {formatCurrency(doctor.consultationFee)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Rating</p>
            <p className="mt-1 font-semibold text-slate-900">{doctor.rating}/5</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Location</p>
            <p className="mt-1 font-semibold text-slate-900">{doctor.location}</p>
          </div>
        </div>

        <div className="mt-auto">
          <Link to={`/doctors/${doctor.id}`}>
            <Button className="w-full" variant="secondary">
              View profile
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
