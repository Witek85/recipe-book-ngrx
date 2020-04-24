import { Recipe } from '../recipe.model';
import * as RecipesActions from './recipe.actions';

export interface State {
  recipes: Recipe[];
}

const initialState: State = {
  recipes: []
};

export function recipeReducer(
  state: State = initialState,
  action: RecipesActions.RecipesActions
) {
  switch (action.type) {
    case RecipesActions.SET_RECIPES :
      return {
        ...state,
        recipes: [...action.payload]
      };
      case RecipesActions.ADD_RECIPE:
        return {
          ...state,
          recipes: [...state.recipes, action.payload]
        };
      case RecipesActions.UPDATE_RECIPE :
        // find recipe we wanna update
        // then copy it
        // then change it
        // then copy the list of recipes
        // then replace the updated recipe in the copied list
        // then use that changed list in the new list of recipes

        // jest jako obiekt, ponieważ to ma być kopia a nie referencja
        const updatedRecipe = {
          ...state.recipes[action.payload.index],
          ...action.payload.newRecipe
        };

        const updatedRecipes = [...state.recipes];
        updatedRecipes[action.payload.index] = updatedRecipe;

        return {
          ...state,
          recipes: updatedRecipes
        };
      case RecipesActions.DELETE_RECIPE :
        return {
          ...state,
          recipes: state.recipes.filter((recipe, index) => {
            return index !== action.payload
          })
        };
    default:
      return state;
  }
}
