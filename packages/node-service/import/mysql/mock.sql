/*
 * File: mock.sql
 * File Created: Tuesday, 6th November 2018 7:15:17 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(30) NOT NULL,
    lastname VARCHAR(30) NOT NULL,
    email VARCHAR(50),
    reg_date TIMESTAMP
)
