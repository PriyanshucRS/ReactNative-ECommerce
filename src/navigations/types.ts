export interface DetailsProductParam {
  id?: string;
  _id?: string;
  userId?: string;
  image: string;
  category: string;
  title: string;
  name: string;
  price: number;
  description: string;
}

export type RootStackParamList = {
  loginScreen: undefined;
  otpScreen: {
    identifier: string;
    authMode: 'backend';
  };
  registerScreen:
    | undefined
    | {
        prefillEmail?: string;
        prefillPhone?: string;
        prefillFirstName?: string;
        prefillLastName?: string;
      };
  MainDrawer: undefined;
  detailsScreen: { product: DetailsProductParam };
  AddProductScreen:
    | undefined
    | {
        product: DetailsProductParam;
      };
};
