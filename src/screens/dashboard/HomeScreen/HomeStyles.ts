import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    marginTop: 10,
  },

  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    marginBottom: 16,
    borderRadius: 15,
    elevation: 4,
    overflow: 'hidden',
  },
  Imgcontainer: {
    backgroundColor: '#FFFFFF',
    height: 150,
    width: '100%',
    padding: 10,
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
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  desc: {
    fontSize: 11,
    color: '#6B7280',
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
    color: '#10B981',
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
