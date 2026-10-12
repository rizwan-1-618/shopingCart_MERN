import Field from "./Field";

const fields = [
  { name: "fullName", label: "Full Name", autoComplete: "name" },
  { name: "phone", label: "Phone", autoComplete: "tel", inputMode: "numeric" },
  { name: "addressLine1", label: "Address", autoComplete: "address-line1" },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "state", label: "State", autoComplete: "address-level1" },
  { name: "pincode", label: "Pincode", autoComplete: "postal-code", inputMode: "numeric" },
];

export default function CheckoutForm({ values, errors, onChange }) {
  return (
    <div className="grid gap-4">
      {fields.map((field) => (
        <Field
          key={field.name}
          id={field.name}
          name={field.name}
          label={field.label}
          autoComplete={field.autoComplete}
          inputMode={field.inputMode}
          value={values[field.name]}
          error={errors[field.name]}
          onChange={(event) => onChange(field.name, event.target.value)}
        />
      ))}
    </div>
  );
}
