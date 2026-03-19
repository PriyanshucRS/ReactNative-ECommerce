import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageBox: {
    backgroundColor: '#F9FAFB',
    width: '100%',
    height: 380,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '85%',
    height: '85%',
    resizeMode: 'contain',
  },
  infoBox: {
    padding: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#FFFFFF',
    marginTop: -30,
  },
  category: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 20,
  },
  descTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  desc: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  button: {
    backgroundColor: '#111827',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
