"use client";

import { useActionState } from "react";
import {
  createCaregiverActivityAction,
  createDoctorVisitAction,
  createHealthLogAction,
  createMedicineLogAction,
  createReminderAction,
  createTemperatureLogAction,
  uploadDocumentAction
} from "@/lib/health/actions";
import { documentCategories, documentCategoryLabels, trackingCategories, trackingCategoryLabels } from "@/lib/health/constants";
import { caregiverActivityLabels, caregiverActivityTypes, notificationUrgencies, notificationUrgencyLabels, privacyLevelLabels, privacyLevels } from "@/lib/health/constants";
import type { FamilyMember } from "@/lib/health/types";
import { ActionToast, FormSubmit, initialActionState } from "@/components/forms/action-feedback";
import { Field, SelectField, TextareaField } from "@/components/forms/form-fields";

const memberOptions = (members: FamilyMember[]) => members.map((member) => ({ value: member.id, label: member.name }));

export function HealthLogForm({ members, category }: { members: FamilyMember[]; category?: string }) {
  const [state, action] = useActionState(createHealthLogAction, initialActionState);

  return (
    <form action={action} className="space-y-4">
      <ActionToast state={state} />
      <SelectField label="Family member" name="family_member_id" options={memberOptions(members)} placeholder="Select member" required />
      {category ? (
        <input name="category" type="hidden" value={category} />
      ) : (
        <SelectField
          label="Category"
          name="category"
          options={trackingCategories.map((value) => ({ value, label: trackingCategoryLabels[value] }))}
          placeholder="Select category"
          required
        />
      )}
      <Field label="Title" name="title" placeholder="Headache, blood pressure, mood check" required />
      <Field label="Logged at" name="logged_at" type="datetime-local" />
      <Field label="Severity 0-10" name="severity" type="number" />
      <Field label="Blood pressure" name="blood_pressure" placeholder="120/80" />
      <Field label="Weight" name="weight" placeholder="72 kg" />
      <Field label="Mood" name="mood" placeholder="Calm, anxious, tired" />
      <Field label="Pain level" name="pain_level" placeholder="0-10" />
      <SelectField
        label="Privacy"
        name="privacy_level"
        options={privacyLevels.map((value) => ({ value, label: privacyLevelLabels[value] }))}
        placeholder="Family shared"
      />
      <TextareaField label="Notes" name="notes" />
      <FormSubmit>Add log</FormSubmit>
    </form>
  );
}

export function CaregiverActivityForm({ members }: { members: FamilyMember[] }) {
  const [state, action] = useActionState(createCaregiverActivityAction, initialActionState);
  const children = members.filter((member) => ["baby", "child"].includes(member.profile_type));
  const childOptions = (children.length ? children : members).map((member) => ({ value: member.id, label: member.name }));

  return (
    <form action={action} className="space-y-4">
      <ActionToast state={state} />
      <SelectField label="Child" name="child_id" options={childOptions} placeholder="Select child" required />
      <SelectField
        label="Quick action"
        name="activity_type"
        options={caregiverActivityTypes.map((value) => ({ value, label: caregiverActivityLabels[value] }))}
        placeholder="Select action"
        required
      />
      <SelectField
        label="Urgency"
        name="urgency"
        options={notificationUrgencies.map((value) => ({ value, label: notificationUrgencyLabels[value] }))}
        placeholder="Select urgency"
        required
      />
      <Field label="Title" name="title" placeholder="Lunch finished, mild temperature, nap started" required />
      <Field label="Time" name="logged_at" type="datetime-local" />
      <label className="flex items-center gap-3 text-sm text-slate-300">
        <input className="h-4 w-4 rounded border-white/20 bg-slate-950" defaultChecked name="share_with_parents" type="checkbox" />
        Share with parents
      </label>
      <TextareaField label="Notes" name="notes" />
      <FormSubmit>Log caregiver activity</FormSubmit>
    </form>
  );
}

export function MedicineLogForm({ members }: { members: FamilyMember[] }) {
  const [state, action] = useActionState(createMedicineLogAction, initialActionState);

  return (
    <form action={action} className="space-y-4">
      <ActionToast state={state} />
      <SelectField label="Family member" name="family_member_id" options={memberOptions(members)} placeholder="Select member" required />
      <Field label="Medicine" name="medicine_name" required />
      <Field label="Dosage" name="dosage" placeholder="500mg, 1 tablet" />
      <Field label="Taken at" name="taken_at" type="datetime-local" />
      <Field label="Next dose" name="next_dose_at" type="datetime-local" />
      <TextareaField label="Notes" name="notes" />
      <FormSubmit>Log medicine</FormSubmit>
    </form>
  );
}

export function TemperatureLogForm({ members }: { members: FamilyMember[] }) {
  const [state, action] = useActionState(createTemperatureLogAction, initialActionState);

  return (
    <form action={action} className="space-y-4">
      <ActionToast state={state} />
      <SelectField label="Family member" name="family_member_id" options={memberOptions(members)} placeholder="Select member" required />
      <Field label="Temperature C" name="temperature_c" required type="number" />
      <Field label="Measured at" name="measured_at" type="datetime-local" />
      <Field label="Method" name="method" placeholder="Oral, ear, forehead" />
      <TextareaField label="Notes" name="notes" />
      <FormSubmit>Log temperature</FormSubmit>
    </form>
  );
}

export function DoctorVisitForm({ members }: { members: FamilyMember[] }) {
  const [state, action] = useActionState(createDoctorVisitAction, initialActionState);

  return (
    <form action={action} className="space-y-4">
      <ActionToast state={state} />
      <SelectField label="Family member" name="family_member_id" options={memberOptions(members)} placeholder="Select member" required />
      <Field label="Doctor" name="doctor_name" />
      <Field label="Visit date" name="visit_at" required type="datetime-local" />
      <Field label="Reason" name="reason" required />
      <Field label="Follow-up" name="follow_up_at" type="datetime-local" />
      <TextareaField label="Notes" name="notes" />
      <FormSubmit>Add visit</FormSubmit>
    </form>
  );
}

export function ReminderForm({ members }: { members: FamilyMember[] }) {
  const [state, action] = useActionState(createReminderAction, initialActionState);

  return (
    <form action={action} className="space-y-4">
      <ActionToast state={state} />
      <SelectField label="Family member" name="family_member_id" options={memberOptions(members)} placeholder="Optional member" />
      <Field label="Title" name="title" required />
      <Field label="Type" name="reminder_type" placeholder="appointment, medicine, vaccination" required />
      <Field label="Due at" name="due_at" required type="datetime-local" />
      <TextareaField label="Notes" name="notes" />
      <FormSubmit>Create reminder</FormSubmit>
    </form>
  );
}

export function DocumentUploadForm({ members }: { members: FamilyMember[] }) {
  const [state, action] = useActionState(uploadDocumentAction, initialActionState);

  return (
    <form action={action} className="space-y-4">
      <ActionToast state={state} />
      <SelectField label="Family member" name="family_member_id" options={memberOptions(members)} placeholder="Select member" required />
      <SelectField
        label="Category"
        name="category"
        options={documentCategories.map((value) => ({ value, label: documentCategoryLabels[value] }))}
        placeholder="Select category"
        required
      />
      <Field label="File" name="file" required type="file" />
      <TextareaField label="Notes" name="notes" />
      <FormSubmit>Upload document</FormSubmit>
    </form>
  );
}
