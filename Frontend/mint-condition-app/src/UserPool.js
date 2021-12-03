import {CognitoUserPool} from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "us-east-1_lYMNVNGS2",
  ClientId: "55gonmd538j2k0ob6s6ltaorvj"
}

export default new CognitoUserPool(poolData);