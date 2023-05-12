module.exports = (summary, tags) => {
   return {
      swagger: {
         summary: summary,
         tags: [tags],
      },
   }
}
