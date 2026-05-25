export const AreaHeader = ({
  level,
  score,
  killsToWin,
  medikitCountdown,
  ammoCountdown,
  specialWeaponCountdown,
}: {
  level: number;
  score: number;
  killsToWin: number;
  medikitCountdown: number | null;
  ammoCountdown: number | null;
  specialWeaponCountdown: number | null;
}) => {
  return (
    <>
      <div className="area-header">
        <span>Level {level}</span>
        <span>
          Score: {score} / {killsToWin}
        </span>
      </div>
      <div className="area-header-countdowns">
        {medikitCountdown !== null && (
          <span>Energy in {medikitCountdown}s</span>
        )}
        {ammoCountdown !== null && <span>Ammo in {ammoCountdown}s</span>}
        {specialWeaponCountdown !== null && (
          <span>Special weapon in {specialWeaponCountdown}s</span>
        )}
      </div>
    </>
  );
};
