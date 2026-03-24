import { useCallback } from "react";
import { Column, Row, Switch, Text } from "@/components/ui";
import { Role } from "@/schemas/message";
import { StyleSheet } from "react-native";

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
    (role: Role, switchValue: boolean) => {
      const newRoles = new Set(roles);

      if (switchValue) {
        newRoles.add(role);
      } else {
        newRoles.delete(role);
      }

      setRoles(newRoles);
    },
    [setRoles],
  );

  return (
    <Column style={styles.rolePickerColumn}>
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
      <Text style={styles.namedSwitchText} size={24}>
        {name}
      </Text>
      <Switch onValueChange={onValueChange} />
    </Row>
  );
}

const styles = StyleSheet.create({
  rolePickerColumn: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginHorizontal: 40,
    alignSelf: "stretch",
  },
  namedSwitchText: {
    flex: 1,
  },
});
