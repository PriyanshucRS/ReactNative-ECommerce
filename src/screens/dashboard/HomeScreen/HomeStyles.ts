import { StyleSheet } from 'react-native';
import { colors } from '../../../utils/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingHorizontal: 10,
  },

  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: colors.surfacePrimary,
    width: '48%',
    marginBottom: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  Imgcontainer: {
    backgroundColor: colors.surfaceSecondary,
    height: 150,
    width: '100%',
    padding: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  contentBox: {
    padding: 12,
  },
  category: {
    fontSize: 9,
    color: colors.primary,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  desc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
    height: 32,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.success,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '600',
  },
  welcome: {
    position: 'absolute',
    top: 80,
    right: 20,
    zIndex: 1000,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '70%',
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  welcomeText1: {
    padding: 4,
  },
});
