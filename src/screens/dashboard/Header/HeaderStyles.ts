import { StyleSheet } from 'react-native';

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
    marginLeft: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  spacer: {
    width: 36,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#F0F0F0',
    resizeMode: 'cover',
    overflow: 'hidden',
  },
  Title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    marginLeft: 10,
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
  },
  badge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 14,
  },
  shutterBtn: {},
  shutterText: {},
});
