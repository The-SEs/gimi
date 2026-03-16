import { useState } from "react";

import GimiAlert from "../../components/alert/gimiAlert.tsx";

export default function Dashboard() {
  const [showAlert, setShowAlert] = useState(true);

  return (
    <section className="relative min-h-[520px]">
      {showAlert && (
        <div className="absolute bottom-5 left-5 right-5 sm:left-auto sm:right-5">
          <GimiAlert
            className="w-full sm:w-[390px]"
            onClose={() => setShowAlert(false)}
          />
        </div>
      )}
    </section>
  );
}
