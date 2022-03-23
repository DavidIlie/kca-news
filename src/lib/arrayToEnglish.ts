const arrayToEnglish = (array: Array<string>, limit?: number) => {
   let final = "";

   const length = array.length;

   if (length > 1) {
      array.forEach((item, index) => {
         if (final !== "") {
            if (limit && length > limit) {
               if (index <= limit - 1) {
                  if (item === array[length - 1] && length > 2) {
                     final = final + " and " + item;
                  } else {
                     final = final + ", " + item;
                  }
               }
            } else {
               if (length === 2) {
                  final = final + " and " + item;
               } else if (item === array[length - 1] && length > 2) {
                  final = final + " and " + item;
               } else {
                  final = final + ", " + item;
               }
            }
         } else {
            final = item;
         }
      });
      if (limit && length > limit) {
         const itemsLeft = length - limit;
         final = final + ` and ${itemsLeft} more`;
      }
   } else {
      if (array) {
         final = array[0];
      } else {
         final = "";
      }
   }

   return final;
};

export default arrayToEnglish;
