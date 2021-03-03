module.exports = (sequelize, Sequelize) => {


    const File = sequelize.define("file", {
      file_id: {
        primaryKey: true,
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4
      },
      file_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      s3_object_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_date: {
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

    return File;
  };
