import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { fragments as RecipePreviewFragments } from 'containers/recipes/_RecipePreview';
import formatErrors from 'utils/errorsUtils';
import withFlashMessage from 'components/withFlashMessage';
import updateQueries from 'reducers/recipesReducer';

export default function(WrappedComponent) {
  function onResult(response) {
    const errors = response.errors || formatErrors(response.data.createRecipe.messages);
    if (!errors) {
      this.redirect('/', { notice: 'La recette a bien été créée.' });
    } else {
      this.error('Des erreurs ont eu lieu, veuillez vérifier :');
    }
    return errors;
  }

  const withCreateRecipe = graphql(
    gql`
      mutation createRecipe($title: String, $content: String, $totalTime: String, $level: String, $budget: String) {
        createRecipe(input: {title: $title, content: $content, totalTime: $totalTime, level: $level, budget: $budget}) {
          newRecipe: result {
            ...RecipePreviewFragment
          }
          messages {
            field
            message
          }
        }
      }
      ${RecipePreviewFragments.recipe}
    `,
    {
      props: ({ ownProps, mutate }) => ({
        createRecipe(recipe) {
          return mutate({
            variables: { ...recipe },
            updateQueries
          })
            .then(onResult.bind(ownProps))
            .catch(error => {
              ownProps.error("Oups, nous sommes désolés, mais quelque chose s'est mal passé");
              return error;
            });
        }
      })
    }
  );

  return withFlashMessage(withCreateRecipe(WrappedComponent));
}
