import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 25,
    paddingTop: 40,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  avoidContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 36,
  },

  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#1F2937',
    marginTop: 15,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 55,
    marginTop: 15,
    overflow: 'hidden',
  },

  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  iconButton: {
    height: '100%',
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
    fontWeight: '600',
  },
  btn: {
    backgroundColor: '#1F2937',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  new: {
    marginTop: 20,
  },
  text1: {
    color: '#3B82F6',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  new1: {
    marginTop: 15,
  },
  text: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 14,
  },
});
