import { StyleSheet } from 'react-native';

export const cartStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 15,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    marginBottom: 15,
    elevation: 3,
    alignItems: 'center',
  },
  imgBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 5,
  },
  img: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  info: {
    flex: 1,
    marginLeft: 15,
    paddingVertical: 5,
  },
  category: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10B981',
    marginVertical: 4,
  },
  desc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  removeBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  removeText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
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
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
