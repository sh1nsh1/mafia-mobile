import { useCallback } from "react";
import { Column, Row, Switch, Text } from "@/components/ui";
import { Role } from "@/schemas/message";

type NamedRole = { name: string; role: Role };
const namedRoles: NamedRole[] = [
  { name: "Доктор", role: "Doctor" },
  { name: "Проститутка", role: "Prostitute" },
  { name: "Шериф", role: "Sheriff" },
  { name: "Дон", role: "MafiaDon" },
  { name: "Маньяк", role: "Maniac" },
];

type RolePickerProps = {
  roles: Set<Role>;
  setRoles: (roles: Set<Role>) => void;
};

export function RolePicker({ roles, setRoles }: RolePickerProps) {
  const updateRoles = useCallback(
    (role: Role, value: boolean) => {
      const newRoles = new Set(roles);

      if (value) {
        newRoles.add(role);
      } else {
        newRoles.delete(role);
      }

      setRoles(newRoles);
    },
    [setRoles],
  );

  return (
    <Column
      style={{
        borderWidth: 1,
        padding: 10,
        borderRadius: 6,
        marginHorizontal: 40,
        alignSelf: "stretch",
      }}
    >
      {namedRoles.map(({ name, role }) => (
        <NamedSwitch name={name} onValueChange={value => updateRoles(role, value)} />
      ))}
    </Column>
  );
}

type NamedSwitchProps = {
  name: string;
  onValueChange: (value: boolean) => void;
};

function NamedSwitch({ name, onValueChange }: NamedSwitchProps) {
  return (
    <Row items="center" gap={10}>
      <Text style={{ flex: 1 }} size={24}>
        {name}
      </Text>
      <Switch onValueChange={onValueChange} />
    </Row>
  );
}
