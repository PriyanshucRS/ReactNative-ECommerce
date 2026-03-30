import { StyleSheet } from 'react-native';

export const cartStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    marginHorizontal: 15,
    marginTop: 15,
    elevation: 3,
    alignItems: 'center',
  },
  imgBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 5,
  },
  img: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  info: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  category: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
    marginVertical: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  btnAction: {
    width: 28,
    height: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  btnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 12,
    color: '#1F2937',
  },
  removeBtn: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  removeText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  checkoutBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  empty: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  unitPrice: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginVertical: 2,
  },
});
