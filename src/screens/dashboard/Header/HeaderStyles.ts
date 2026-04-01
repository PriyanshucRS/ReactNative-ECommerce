import { StyleSheet } from 'react-native';
import { colors } from '../../../utils/colors';

export const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingRight: 20,
    marginBottom: 20,
  },
  menuBtn: {
    padding: 8,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingRight: 20,
  },
  spacer: {
    width: 44,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.textPrimary,
    backgroundColor: colors.surfaceSecondary,
    resizeMode: 'cover',
    overflow: 'hidden',
  },
  Title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginLeft: 15,
  },
  cartWrapper: {
    padding: 5,
    marginLeft: 30,
    position: 'relative',
  },
  cartLogo: {
    height: 35,
    width: 35,
    resizeMode: 'contain',
    tintColor: colors.textPrimary,
  },
  badge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: colors.danger,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
  },
  badgeText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 14,
  },
  shutterBtn: {},
  shutterText: {},
});
