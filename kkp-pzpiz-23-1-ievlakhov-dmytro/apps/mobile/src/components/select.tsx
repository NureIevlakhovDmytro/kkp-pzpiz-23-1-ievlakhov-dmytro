import { useState } from 'react';
import { FlatList, Modal, Pressable, Text } from 'react-native';

export interface SelectOption {
  value: string;
  label: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = '—',
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <>
      <Pressable
        className={`rounded-md border border-input bg-card px-3 py-3 ${disabled ? 'opacity-50' : ''}`}
        disabled={disabled}
        onPress={() => setOpen(true)}
      >
        <Text className={current ? 'text-foreground' : 'text-muted-foreground'}>
          {current?.label ?? placeholder}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <Pressable className="max-h-[60%] rounded-t-2xl bg-card p-2" onPress={(e) => e.stopPropagation()}>
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              renderItem={({ item }) => (
                <Pressable
                  className="border-b border-border px-4 py-3"
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text className={item.value === value ? 'font-semibold text-primary' : 'text-foreground'}>
                    {item.label}
                  </Text>
                </Pressable>
              )}
              ListEmptyComponent={<Text className="p-4 text-muted-foreground">—</Text>}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
