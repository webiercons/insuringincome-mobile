import { type Href, Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PublicColors } from '@/constants/public-theme';

type CtaCardProps = {
  title: string;
  description: string;
  href: Href;
};

export function CtaCard({ title, description, href }: CtaCardProps) {
  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={styles.row}>
          <View style={styles.textBlock}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PublicColors.surface,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PublicColors.border,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.92,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: PublicColors.text,
  },
  description: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: PublicColors.textMuted,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
    color: PublicColors.accentMuted,
  },
});
