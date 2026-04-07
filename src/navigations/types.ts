export interface DetailsProductParam {
  id?: string;
  _id?: string;
  image: string;
  category: string;
  title: string;
  name: string;
  price: number;
  description: string;
}

export type RootStackParamList = {
  loginScreen: undefined;
  registerScreen: undefined;
  MainDrawer: undefined;
  detailsScreen: { product: DetailsProductParam };
  AddProductScreen: undefined;
};
