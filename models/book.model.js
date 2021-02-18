module.exports = (sequelize, Sequelize) => {


    const Book = sequelize.define("book", {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      author: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isbn: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      published_date: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      book_created: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },     
    }, {
      timestamps: false,
    }
    )

    return Book;
  };
