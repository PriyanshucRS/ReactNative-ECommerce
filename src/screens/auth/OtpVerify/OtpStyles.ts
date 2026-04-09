import { StyleSheet } from 'react-native';
import { colors } from '../../../utils/colors';

export const styles = StyleSheet.create({
  avoidContainer: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  container: {
    flexGrow: 1,
    padding: 25,
    paddingTop: 40,
    paddingBottom: 40,
    backgroundColor: colors.backgroundPrimary,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 34,
  },
  subText: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  otpBox: {
    width: 44,
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
  },
  otpBoxActive: {
    borderColor: colors.primary,
  },
  btn: {
    backgroundColor: colors.primary,
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  otpInfoText: {
    marginTop: 12,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  resendLink: {
    marginTop: 12,
    alignSelf: 'center',
  },
  resendText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  changeLink: {
    marginTop: 18,
    alignSelf: 'center',
  },
  changeText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});

