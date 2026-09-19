export type AdminActionState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export const INITIAL_ACTION_STATE: AdminActionState = {
  status: "idle",
  message: "",
};
