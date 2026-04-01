import { StyleSheet } from 'react-native';
import { colors } from '../utils/colors';

export const drawerContentStyles = StyleSheet.create({
  drawerContent: {
    backgroundColor: colors.backgroundSecondary,
    flex: 1,
  },
  drawerItem: {
    backgroundColor: colors.surfacePrimary,
    marginVertical: 6,
    marginHorizontal: 12,
    borderRadius: 12,
    paddingVertical: 4,
  },
  drawerLabel: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
    marginLeft: 10,
  },
  drawerActive: {
    backgroundColor: colors.primary + '22',
  },
  logoutItem: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: `${colors.danger}44`,
    marginTop: 'auto',
    marginBottom: 20,
    marginHorizontal: 15,
    borderRadius: 12,
    paddingVertical: 5,
  },

  logoutLabel: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },

  iconWrapper: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
});
