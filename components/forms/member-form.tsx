"use client";

import { useActionState } from "react";
import { createFamilyMemberAction } from "@/lib/health/actions";
import { genders, profileTypeLabels, profileTypes } from "@/lib/health/constants";
import { ActionToast, FormSubmit, initialActionState } from "@/components/forms/action-feedback";
import { Field, SelectField, TextareaField } from "@/components/forms/form-fields";

export function MemberForm() {
  const [state, action] = useActionState(createFamilyMemberAction, initialActionState);

  return (
    <form action={action} className="space-y-4">
      <ActionToast state={state} />
      <Field label="Name" name="name" placeholder="Sarah Johnson" required />
      <Field label="Relationship" name="relationship" placeholder="Mother, child, caregiver" />
      <SelectField
        label="Profile type"
        name="profile_type"
        options={profileTypes.map((value) => ({ value, label: profileTypeLabels[value] }))}
        placeholder="Select profile type"
        required
      />
      <Field label="Date of birth" name="date_of_birth" type="date" />
      <SelectField
        label="Gender"
        name="gender"
        options={genders.map((value) => ({ value, label: value.replaceAll("_", " ") }))}
        placeholder="Select gender"
      />
      <TextareaField label="Allergies" name="allergies" placeholder="Medication, food, environmental allergies" />
      <TextareaField label="Medical notes" name="medical_notes" />
      <TextareaField label="Doctor details" name="doctor_details" />
      <TextareaField label="Emergency notes" name="emergency_notes" />
      <FormSubmit>Save family member</FormSubmit>
    </form>
  );
}
